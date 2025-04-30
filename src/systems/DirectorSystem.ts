import { GameEvent } from "../game-state/GameEvent"
import { GameState } from "../game-state/GameState"

const SLEW_RATE = 100 / 2000
const SEC_PER_MS = 1 / 1000
const INTENSITY_FILTER_SLEW_RATE = SLEW_RATE * SEC_PER_MS

export const DirectorSystem = {
    run(gameState: GameState) {
        for (const event of gameState.publishedEvents) {
            if (GameEvent.isSpawnEvent(event)) {
                gameState.intensity += event.intensity
            } else if (GameEvent.isDeathEvent(event)) {
                gameState.intensity -= event.intensity
            }
        }

        gameState.intensityFiltered = Math.max(
            gameState.intensity,
            Math.round(gameState.intensityFiltered - (100 * gameState.frameLength / (1000 * 3)))
        )
    }
}
