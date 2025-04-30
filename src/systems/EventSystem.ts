import { GameEvent } from "../game-state/GameEvent";
import { GameState } from "../game-state/GameState";

export const EventSystem = {
    run: (state: GameState) => {
        for (const event of state.publishedEvents) {
            if (!GameEvent.isNullEvent(event)) {
                GameEvent.releaseEvent(event)
            }
        }

        const newlyFreed = state.publishedEvents
        state.publishedEvents = state.pendingEvents
        state.pendingEvents = newlyFreed
    },
}
