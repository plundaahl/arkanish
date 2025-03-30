import { GameEvent } from "../game-state/GameEvent";
import { GameState } from "../game-state/GameState";

export const EventSystem = {
    run: (state: GameState) => {
        const temp = state.publishedEvents
        state.publishedEvents = state.pendingEvents
        state.pendingEvents = temp

        for (const event of state.pendingEvents) {
            GameEvent.releaseEvent(event)
        }
    },
    cleanup: (state: GameState) => {},
}
