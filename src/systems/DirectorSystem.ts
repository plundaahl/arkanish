import { GameEvent } from "../game-state/GameEvent"
import { GameState } from "../game-state/GameState"

export const DirectorSystem = {
    run(gameState: GameState) {
        for (const event of gameState.publishedEvents) {
            if (GameEvent.isSpawnEvent(event)) {
                gameState.intensity += event.intensity
            } else if (GameEvent.isDeathEvent(event)) {
                gameState.intensity -= event.intensity
            }
        }
    }
}
