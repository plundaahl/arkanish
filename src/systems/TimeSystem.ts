import { GameState } from "../game-state/GameState";

export const TimeSystem = {
    run(gameState: GameState, inputTime: number) {
        gameState.frameLength = inputTime - gameState.time
        gameState.time = inputTime
    },
}
