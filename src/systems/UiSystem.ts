import { World } from "../game-state/Entity"
import { RenderCommandBuffer } from "../RenderCommand"
import { renderBox, renderText } from "./RenderSystem"
import { GameState } from "../game-state/GameState"
import { UiState, GuiState } from "../ui-state"

const PAUSE_BTN_W = 60
const PAUSE_BTN_H = 60
const PAUSE_BTN_OFFSET = 30
const PAUSE_BTN_INSET = 8

export const UiSystem = {
    run(gameState: GameState, uiState: UiState, buffer: RenderCommandBuffer) {
        uiState.guiElementCounter = 0

        const player = World.getEntity(gameState, gameState.playerId)
        const hpText = `HP: ${player?.hp || 0}`
        const scoreText = `Score: ${gameState.score}`
        // const frameRate = `Framerate: ${Math.round(100000 / this.state.frameLength) * 0.01}`
        RenderCommandBuffer.addCustomRenderCmd(buffer, 1000, renderText, [hpText, scoreText])

        pauseButton(gameState, uiState, buffer, uiState.playArea.width - PAUSE_BTN_OFFSET - PAUSE_BTN_W, PAUSE_BTN_OFFSET)
    },
}

const INNER_W = PAUSE_BTN_W - (PAUSE_BTN_INSET * 2)
const INNER_H = PAUSE_BTN_H - (PAUSE_BTN_INSET * 2)
const COL_W = INNER_W / 3
const COL_1 = PAUSE_BTN_INSET
const COL_3 = COL_1 + COL_W + COL_W

function pauseButton(gameState: GameState, uiState: UiState, buffer: RenderCommandBuffer, x: number, y: number) {
    const paused = !gameState.running
    RenderCommandBuffer.addCustomRenderCmd(
        buffer, 1000, renderBox, 'white', false,
        x, y, PAUSE_BTN_W, PAUSE_BTN_H
    )
    RenderCommandBuffer.addCustomRenderCmd(
        buffer, 1000, renderBox, 'white', paused,
        x + COL_1, y + PAUSE_BTN_INSET, COL_W, INNER_H
    )
    RenderCommandBuffer.addCustomRenderCmd(
        buffer, 1000, renderBox, 'white', paused,
        x + COL_3, y + PAUSE_BTN_INSET, COL_W, INNER_H
    )
    if (GuiState.isBoxInteracted(uiState, x, y, PAUSE_BTN_W, PAUSE_BTN_H)) {
        gameState.running = !gameState.running
        console.log(gameState.running ? 'Resumed' : 'Paused')
    }
}
