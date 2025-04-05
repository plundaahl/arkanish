import { Flag } from "../game-state/Flag";
import { Entity, EntityFlags, EntityStates, World } from "../game-state/Entity";
import { Script } from '../scripts/Script'
import { PlayerScript } from "../scripts/PlayerScript";
import { GameEventType } from "../game-state/GameEvent";
import { PowerupScript } from "../scripts/PowerupScript";
import { BulletScript } from "../scripts/BulletScript";
import { GameState } from '../game-state/GameState'
import { AsteroidSpawnerScript } from "../scripts/AsteroidSpawnerScript";
import { CoinScript } from "../scripts/CoinScript";
import { BouncyBallScript } from "../scripts/BouncyBallScript";

const registeredScripts: [string, Script][] = []
const findMachineById = (id: string) => registeredScripts.find(record => record[0] === id)?.[1]
const findIdByMachine = (machine: Script) => registeredScripts.find(record => Object.is(record[1], machine))?.[0]
const registerScripts = (...scripts: Script[]) => {
    for (const script of scripts) {
        for (const [_, mach] of registeredScripts) {
            if (Object.is(mach, script)) {
                throw new Error(`Tried to register the same machine twice`)
            }
        }
        registeredScripts.push([script.id, script])
    }
}

registerScripts(
    PlayerScript,
    PowerupScript,
    CoinScript,
    BulletScript,
    AsteroidSpawnerScript,
    BouncyBallScript,
)

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
            if (entity && entity.state === EntityStates.ALIVE && Flag.hasBigintFlags(entity.flags, EntityFlags.SCRIPT) && machine) {
                machine.handleEvent(state, entity, event)
            }
        }

        // Run per-frame update
        for (let i = 0; i < state.entities.length; i++) {
            const entity = state.entities[i]
            const machine = findMachineById(entity.script)

            if (entity.state === EntityStates.ALIVE
                && Flag.hasBigintFlags(entity.flags, EntityFlags.SCRIPT)
                && machine
            ) {
                machine.update(state, entity)
            }
        }
    },
    enterState: (world: GameState, entity: Entity, machine: Script, state: number) => {
        const machineId = findIdByMachine(machine)
        if (machineId && entity.state === EntityStates.ALIVE && Flag.hasBigintFlags(entity.flags, EntityFlags.SCRIPT)) {
            entity.script = machineId
            entity.scriptState = state
            entity.scriptTimeEnteredState = world.time
        }
    },
}
