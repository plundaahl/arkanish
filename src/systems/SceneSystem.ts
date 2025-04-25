import { SceneRegistry } from "../game-state/Scene";
import { GameState } from "../game-state/GameState";
import { UiState } from "../ui-state";

export const SceneSystem = {
    run(gameState: GameState, uiState: UiState) {
        if (gameState.scene) {
            const currentScene = SceneRegistry.getScene(gameState.scene)
            if (currentScene.onUpdate) {
                currentScene.onUpdate(gameState, uiState)
            }
        }

        if (gameState.pendingScene) {
            const currentScene = gameState.scene ? SceneRegistry.getScene(gameState.scene) : undefined
            if (currentScene && currentScene.onEnd) {
                currentScene.onEnd(gameState, uiState)
            }

            const pendingScene = gameState.pendingScene

            GameState.reset(gameState)

            gameState.scene = pendingScene
            gameState.pendingScene = ''

            const nextScene = SceneRegistry.getScene(gameState.scene)
            if (nextScene.onStart) {
                nextScene.onStart(gameState, uiState)
            }
        }
    },
}
