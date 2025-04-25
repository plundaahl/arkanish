import { CONTROLLER_FIRE } from "../game-state/Script";
import { World } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";
import { Buttons, ButtonState, CURSOR_DOWN, UiState } from "../ui-state";

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

        // Keys
        if (ButtonState.pressed(uiState, Buttons.MENU)) {
            gameState.running = !gameState.running
            console.log(gameState.running ? 'Resumed' : 'Paused')
        }

        // Incorporate player input
        let moveImpulseX: number = 0
        let moveImpulseY: number = 0
        let controllerFlags: number = 0

        const player = World.getEntity(gameState, gameState.playerId)
        if (!player) {
            return
        }

        // Mouse
        if (uiState.cursorActive) {
            moveImpulseX = UiState.canvasXToGameX(gameState, uiState, uiState.cursorX)
            moveImpulseY = UiState.canvasYToGameY(gameState, uiState, uiState.cursorY)
            if (uiState.cursorState === CURSOR_DOWN) {
                controllerFlags |= CONTROLLER_FIRE
            }
        }

        // Touch
        let shipTouch = uiState.touches.find(touch => touch.element === 1)
        for (const touch of uiState.touches) {
            if (!shipTouch && touch.element === 0) {
                touch.element = 1
                touch.offsetX = (player?.posXL || 0) - UiState.canvasXToGameX(gameState, uiState, touch.x)
                touch.offsetY = (player?.posYL || 0) - UiState.canvasYToGameY(gameState, uiState, touch.y)
                shipTouch = touch
            }
        }
        if (shipTouch) {
            moveImpulseX = UiState.canvasXToGameX(gameState, uiState, shipTouch.x) + shipTouch.offsetX
            moveImpulseY = UiState.canvasYToGameY(gameState, uiState, shipTouch.y) + shipTouch.offsetY
            if (shipTouch.state === CURSOR_DOWN) {
                controllerFlags |= CONTROLLER_FIRE
            }
        }

        if (player.script?.onInput) {
            player.script?.onInput(gameState, player as any, moveImpulseX, moveImpulseY, controllerFlags)
        }
    }
}