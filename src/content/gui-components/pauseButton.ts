import { GameState } from "../../game-state/GameState"
import { RenderCommandBuffer } from "../../RenderCommand"
import { renderBox, RenderFlags } from "../../systems"
import { Gui, GuiStates, UiState } from "../../ui-state"

const PAUSE_BTN_W = 60
const PAUSE_BTN_H = 60
const PAUSE_BTN_INSET = 8

const INNER_W = PAUSE_BTN_W - (PAUSE_BTN_INSET * 2)
const INNER_H = PAUSE_BTN_H - (PAUSE_BTN_INSET * 2)
const COL_W = INNER_W / 3
const COL_1 = PAUSE_BTN_INSET
const COL_3 = COL_1 + COL_W + COL_W

export function pauseButton(
    gameState: GameState,
    uiState: UiState,
    buffer: RenderCommandBuffer,
    x: number,
    y: number,
) {
    const buttonState = Gui.boxElement(uiState, x, y, PAUSE_BTN_W, PAUSE_BTN_H)
    const paused = !gameState.running

    let flags = 0
    if (buttonState !== GuiStates.NONE || paused) {
        flags |= RenderFlags.FILL
    }

    RenderCommandBuffer.addCustomRenderCmd(
        buffer, 1000, renderBox,
        x, y, PAUSE_BTN_W, PAUSE_BTN_H,
        'white',
    )
    RenderCommandBuffer.addCustomRenderCmd(
        buffer, 1000, renderBox,
        x + COL_1, y + PAUSE_BTN_INSET, COL_W, INNER_H,
        'white', flags,
    )
    RenderCommandBuffer.addCustomRenderCmd(
        buffer, 1000, renderBox,
        x + COL_3, y + PAUSE_BTN_INSET, COL_W, INNER_H,
        'white', flags,
    )
    return buttonState === GuiStates.CLICKED
}
