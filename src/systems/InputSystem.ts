import { CONTROLLER_FIRE } from "../game-state/Script";
import { World } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";
import { CURSOR_DOWN, UiState } from "../ui-state";

export const InputSystem = {
    run: (state: GameState, uiState: UiState) => {
        let moveImpulseX: number = 0
            let moveImpulseY: number = 0
            let controllerFlags: number = 0
    
            const player = World.getEntity(state, state.playerId)
            if (!player) {
                return
            }
    
            // Mouse
            if (uiState.cursorActive) {
                moveImpulseX = UiState.canvasXToGameX(state, uiState, uiState.cursorX)
                moveImpulseY = UiState.canvasYToGameY(state, uiState, uiState.cursorY)
                if (uiState.cursorState === CURSOR_DOWN) {
                    controllerFlags |= CONTROLLER_FIRE
                }
            }
    
            // Touch
            let shipTouch = uiState.touches.find(touch => touch.element === 1)
            for (const touch of uiState.touches) {
                if (!shipTouch && touch.element === 0) {
                    touch.element = 1
                    touch.offsetX = (player?.posXL || 0) - UiState.canvasXToGameX(state, uiState, touch.x)
                    touch.offsetY = (player?.posYL || 0) - UiState.canvasYToGameY(state, uiState, touch.y)
                    shipTouch = touch
                }
            }
            if (shipTouch) {
                moveImpulseX = UiState.canvasXToGameX(state, uiState, shipTouch.x) + shipTouch.offsetX
                moveImpulseY = UiState.canvasYToGameY(state, uiState, shipTouch.y) + shipTouch.offsetY
                if (shipTouch.state === CURSOR_DOWN) {
                    controllerFlags |= CONTROLLER_FIRE
                }
            }
    
            if (player.script?.onInput) {
                player.script?.onInput(state, player as any, moveImpulseX, moveImpulseY, controllerFlags)
            }
    }
}