import { RenderCommandBuffer } from "../RenderCommand"
import { GameState } from "../game-state/GameState"
import { UiState, ControllerRegistry } from "../ui-state"

export const UiSystem = {
    run(gameState: GameState, uiState: UiState, buffer: RenderCommandBuffer) {
        uiState.guiElementCounter = 0

        if (uiState.guiController) {
            const controller = ControllerRegistry.getController(uiState.guiController)
            controller.update(gameState, uiState, buffer)
        }
    },
}
