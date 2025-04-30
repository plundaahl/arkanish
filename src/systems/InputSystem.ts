import { GameState } from "../game-state/GameState";
import { CURSOR_IDLE, UiState } from "../ui-state";

export const InputSystem = {
    run: (gameState: GameState, uiState: UiState) => {
        // Calculate play area (note: rendering relies on this as well)
        const canvasAspect = uiState.width / uiState.height
        const playSpaceAspect = gameState.playArea.width / gameState.playArea.height
        const isTooWide = canvasAspect > playSpaceAspect

        const projectionWidth = isTooWide
            ? Math.floor(uiState.height * playSpaceAspect)
            : uiState.width

        const projectionHeight = isTooWide
            ? uiState.height
            : Math.floor(uiState.width / playSpaceAspect)

        uiState.playArea.left = Math.max(uiState.width - projectionWidth, 0) * 0.5
        uiState.playArea.top = Math.max(uiState.height - projectionHeight, 0) * 0.5
        uiState.playArea.width = projectionWidth
        uiState.playArea.height = projectionHeight

        // Input state resets
        if (uiState.cursorState === CURSOR_IDLE && uiState.cursorElementId !== 0) {
            uiState.cursorElementId = 0
        }

        for (const touch of uiState.touches) {
            if (touch.state === CURSOR_IDLE && touch.element !== 0) {
                touch.element = 0
            }
        }
    }
}
