import { GameState } from "../game-state/GameState";

export const TimeSystem = {
    run(gameState: GameState, inputTime: number) {
        const deltaTime = inputTime - gameState.realTime

        gameState.realTime = inputTime

        if (gameState.running) {
            gameState.gameTime += deltaTime
            gameState.frameLength = deltaTime
        }
    },
}
