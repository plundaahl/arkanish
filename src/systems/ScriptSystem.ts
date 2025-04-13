import { Flag } from "../game-state/Flag";
import { Entity, EntityFlags, EntityStates, World } from "../game-state/Entity";
import { Script } from '../game-state/Script'
import { GameEventType } from "../game-state/GameEvent";
import { GameState } from '../game-state/GameState'

export const ScriptSystem = {
    run: (state: GameState): void => {
        // Handle all events
        for (let i = 0; i < state.publishedEvents.length; i++) {
            const event = state.publishedEvents[i];
            if (event.type === GameEventType.NULL) {
                continue
            }
            const entity = World.getEntity(state, event.entity)
            const machine = entity && Script.getScriptById(entity.script)
            if (entity && entity.state === EntityStates.ALIVE && Flag.hasBigintFlags(entity.flags, EntityFlags.SCRIPT) && machine) {
                machine.handleEvent(state, entity, event)
            }
        }

        // Run per-frame update
        for (let i = 0; i < state.entities.length; i++) {
            const entity = state.entities[i]
            const machine = Script.getScriptById(entity.script)

            if (entity.state === EntityStates.ALIVE
                && Flag.hasBigintFlags(entity.flags, EntityFlags.SCRIPT)
                && machine
            ) {
                machine.update(state, entity)
            }
        }
    },
    enterState: (world: GameState, entity: Entity, machine: Script, state: number) => {
        const machineId = machine.id
        if (machineId && entity.state === EntityStates.ALIVE && Flag.hasBigintFlags(entity.flags, EntityFlags.SCRIPT)) {
            entity.script = machineId
            entity.scriptState = state
            entity.scriptTimeEnteredState = world.time
        }
    },
}
