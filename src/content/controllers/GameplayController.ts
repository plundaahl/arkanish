import { renderBox, renderText } from "../../systems";
import { GameState } from "../../game-state/GameState";
import { RenderCommandBuffer } from "../../RenderCommand";
import { Buttons, ButtonState, CURSOR_DOWN, Gui, Controller, GuiStates, UiState } from "../../ui-state";
import { World } from "../../game-state/Entity";
import { CONTROLLER_FIRE } from "../../game-state/Script";

const PAUSE_BTN_W = 60
const PAUSE_BTN_H = 60
const PAUSE_BTN_OFFSET = 30
const PAUSE_BTN_INSET = 8

export const GameplayController: Controller<'GameplayController'> = {
    id: "GameplayController",
    update(gameState: GameState, uiState: UiState, buffer: RenderCommandBuffer): void {
        const player = World.getEntity(gameState, gameState.playerId)

        // Overlay
        statusText(buffer, gameState.score, player?.hp)
        const pauseControlPressed = pauseButton(
            gameState,
            uiState,
            buffer,
            uiState.playArea.width - PAUSE_BTN_OFFSET - PAUSE_BTN_W,
            PAUSE_BTN_OFFSET
        )

        if (ButtonState.pressed(uiState, Buttons.MENU) || pauseControlPressed) {
            gameState.running = !gameState.running
        }

        // Player controls
        if (player) {
            // Incorporate player input
            let moveImpulseX: number = 0
            let moveImpulseY: number = 0
            let controllerFlags: number = 0

            // Mouse Control
            if (uiState.cursorActive && uiState.cursorElementId === 0) {
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
}

function statusText(buffer: RenderCommandBuffer, score: number, hp?: number) {
    const hpText = `HP: ${hp || 0}`
    const scoreText = `Score: ${score}`
    RenderCommandBuffer.addCustomRenderCmd(buffer, 1000, renderText, [hpText, scoreText])
}

const INNER_W = PAUSE_BTN_W - (PAUSE_BTN_INSET * 2)
const INNER_H = PAUSE_BTN_H - (PAUSE_BTN_INSET * 2)
const COL_W = INNER_W / 3
const COL_1 = PAUSE_BTN_INSET
const COL_3 = COL_1 + COL_W + COL_W

function pauseButton(gameState: GameState, uiState: UiState, buffer: RenderCommandBuffer, x: number, y: number) {
    const buttonState = Gui.boxElement(uiState, x, y, PAUSE_BTN_W, PAUSE_BTN_H)
    const paused = !gameState.running

    const fill = buttonState !== GuiStates.NONE || paused

    RenderCommandBuffer.addCustomRenderCmd(
        buffer, 1000, renderBox, 'white', false,
        x, y, PAUSE_BTN_W, PAUSE_BTN_H
    )
    RenderCommandBuffer.addCustomRenderCmd(
        buffer, 1000, renderBox, 'white', fill,
        x + COL_1, y + PAUSE_BTN_INSET, COL_W, INNER_H
    )
    RenderCommandBuffer.addCustomRenderCmd(
        buffer, 1000, renderBox, 'white', fill,
        x + COL_3, y + PAUSE_BTN_INSET, COL_W, INNER_H
    )
    return buttonState === GuiStates.CLICKED
}
