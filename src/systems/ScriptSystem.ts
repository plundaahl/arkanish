import { Flag } from "../game-state/Flag";
import { Entity, EntityFlags, World } from "../game-state/Entity";
import { Script } from '../scripts/Script'
import { PlayerScript } from "../scripts/PlayerScript";
import { GameEventType } from "../game-state/GameEvent";
import { PowerupScript } from "../scripts/PowerupScript";
import { BulletScript } from "../scripts/BulletScript";
import { GameState } from '../game-state/GameState'
import { AsteroidSpawnerScript } from "../scripts/AsteroidSpawnerScript";

const scripts: [string, Script][] = []
const findMachineById = (id: string) => scripts.find(record => record[0] === id)?.[1]
const findIdByMachine = (machine: Script) => scripts.find(record => Object.is(record[1], machine))?.[0]
const registerScript = (script: Script) => {
    for (const [_, mach] of scripts) {
        if (Object.is(mach, script)) {
            throw new Error(`Tried to register the same machine twice`)
        }
    }
    scripts.push([script.id, script])
}

registerScript(PlayerScript)
registerScript(PowerupScript)
registerScript(BulletScript)
registerScript(AsteroidSpawnerScript)

export const ScriptSystem = {
    run: (state: GameState): void => {
        // Handle all events
        for (let i = 0; i < state.publishedEvents.length; i++) {
            const event = state.publishedEvents[i];
            if (event.type === GameEventType.NULL) {
                continue
            }
            const entity = World.getEntity(state, event.entity)
            const machine = entity && findMachineById(entity.script)
            if (entity && Flag.hasBigintFlags(entity.flags, EntityFlags.ALIVE, EntityFlags.SCRIPT) && machine) {
                machine.handleEvent(state, entity, event)
            }
        }

        // Run per-frame update
        for (let i = 0; i < state.entities.length; i++) {
            const entity = state.entities[i]
            const machine = findMachineById(entity.script)

            if (!Flag.hasBigintFlags(entity.flags, EntityFlags.ALIVE, EntityFlags.SCRIPT) || !machine) {
                continue
            }

            machine.update(state, entity)
        }
    },
    enterState: (world: GameState, entity: Entity, machine: Script, state: number) => {
        const machineId = findIdByMachine(machine)
        if (machineId && Flag.hasBigintFlags(entity.flags, EntityFlags.ALIVE, EntityFlags.SCRIPT)) {
            entity.script = machineId
            entity.scriptState = state
            entity.scriptTimeEnteredState = world.time
        }
    },
}
