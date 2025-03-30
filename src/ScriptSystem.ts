import { Flag } from "./Flag";
import { Entity, EntityFlags } from "./Entity";
import { World } from "./World";
import { Script } from './Script/Script'
import { PlayerScript } from "./Script/PlayerScript";
import { GameEventBuffer, GameEventType } from "./GameEvent";
import { PowerupScript } from "./Script/PowerupScript";
import { BulletScript } from "./Script/BulletScript";

let nextMachineId = 1

const scripts: [number, Script][] = []
const findMachineById = (id: number) => scripts.find(record => record[0] === id)?.[1]
const findIdByMachine = (machine: Script) => scripts.find(record => Object.is(record[1], machine))?.[0]
const registerMachine = (machine: Script) => {
    for (const [_, mach] of scripts) {
        if (Object.is(mach, machine)) {
            throw new Error(`Tried to register the same machine twice`)
        }
    }
    scripts.push([nextMachineId++, machine])
}

registerMachine(PlayerScript)
registerMachine(PowerupScript)
registerMachine(BulletScript)

export const ScriptSystem = {
    run: (world: World, eventBuffer: GameEventBuffer): void => {
        // Handle all events
        for (let i = 0; i < eventBuffer.events.length; i++) {
            const event = eventBuffer.events[i];
            if (event.type === GameEventType.NULL) {
                continue
            }
            const entity = World.getEntity(world, event.entity)
            const machine = entity && findMachineById(entity.script)
            if (entity && Flag.hasBigintFlags(entity.flags, EntityFlags.ALIVE, EntityFlags.SCRIPT) && machine) {
                machine.handleEvent(world, entity, event)
            }
        }

        // Run per-frame update
        for (let i = 0; i < world.entities.length; i++) {
            const entity = world.entities[i]
            const machine = findMachineById(entity.script)

            if (!Flag.hasBigintFlags(entity.flags, EntityFlags.ALIVE, EntityFlags.SCRIPT) || !machine) {
                continue
            }

            machine.update(world, entity)
        }
    },
    enterState: (world: World, entity: Entity, machine: Script, state: number) => {
        const machineId = findIdByMachine(machine)
        if (machineId && Flag.hasBigintFlags(entity.flags, EntityFlags.ALIVE, EntityFlags.SCRIPT)) {
            entity.script = machineId
            entity.scriptState = state
            entity.scriptTimeEnteredState = world.lastUpdateTime
        }
    },
    attachScript: (world: World, entity: Entity, script: Script) => {
        const scriptId = findIdByMachine(script)
        if (!scriptId) {
            throw new Error(`No such script id [${scriptId}]`)
        }
        entity.flags |= EntityFlags.SCRIPT
        entity.script = scriptId
        entity.scriptState = 0
        entity.scriptTimeEnteredState = world.lastUpdateTime
    }
}
