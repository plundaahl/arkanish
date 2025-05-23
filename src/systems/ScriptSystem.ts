import { Flag } from "../game-state/Flag";
import { EntityFlags, EntityStates, World } from "../game-state/Entity";
import { GameEvent } from "../game-state/GameEvent";
import { GameState } from '../game-state/GameState'

export const ScriptSystem = {
    run: (state: GameState): void => {
        // Handle all events
        for (let i = 0; i < state.publishedEvents.length; i++) {
            const event = state.publishedEvents[i];
            if (GameEvent.isNullEvent(event)) {
                continue
            }

            const entity = World.getEntity(state, event.entity)
            if (!entity || !Flag.hasBigintFlags(entity.flags, EntityFlags.SCRIPT) || entity.state === EntityStates.SPAWNING) {
                continue
            }
            
            if (entity?.script?.onEvent && entity?.scriptData) {
                entity.script.onEvent(state, entity as any, event)
            }
        }

        // Run per-frame update
        for (let i = 0; i < state.entities.length; i++) {
            const entity = state.entities[i]

            if (!Flag.hasBigintFlags(entity.flags, EntityFlags.SCRIPT) || entity.state !== EntityStates.ALIVE) {
                continue
            }

            if (entity?.script?.onUpdate && entity?.scriptData) {
                entity.script.onUpdate(state, entity as any)
            }
        }
    },
}
