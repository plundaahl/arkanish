import { Controller, UiState, CURSOR_CLICK, CURSOR_DOWN, Gui, GuiStates } from "../../ui-state";
import * as buildInfo from '../../build-info.json'
import { RenderCommandBuffer } from "../../RenderCommand";
import { GameState } from "../../game-state/GameState";
import { Scene } from "../../game-state/Scene";

const TITLE = 'Arkanish'
const START = 'Start'

export const MainMenuController: Controller<'MainMenuController'> = {
    id: "MainMenuController",
    update(gameState, uiState, buffer): void {
        RenderCommandBuffer.addCustomRenderCmd(buffer, 1000, renderMainMenuUi, gameState, uiState)
    }
}

function renderMainMenuUi(ctx: CanvasRenderingContext2D, gameState: GameState, ui: UiState) {
    const height = ui.playArea.height

    // Title
    const layout = { hPos: (4 * height / 12) + ui.playArea.top }
    label(TITLE, '85px serif', 'white', ctx, ui, layout, -50)
    label(`v${buildInfo.version}`, '20px serif', 'white', ctx, ui, layout)
    layout.hPos += 40

    if (mainMenuButton(START, ctx, gameState, ui, layout)) {
        Scene.transitionToScene(gameState, 'Game')
    }
}

function label(text: string, font: string, style: string, ctx: CanvasRenderingContext2D, ui: UiState, layout: { hPos: number }, margin: number = 0) {
    const halfW = ui.playArea.width / 2
    ctx.save()
    ctx.font = font
    ctx.fillStyle = style
    const textMetrics = ctx.measureText(text)
    ctx.fillText(text, halfW - (textMetrics.width / 2), layout.hPos + margin)
    layout.hPos += textMetrics.emHeightAscent + textMetrics.emHeightDescent + (margin * 2)
    ctx.restore()
}

function mainMenuButton(label: string, ctx: CanvasRenderingContext2D, gameState: GameState, ui: UiState, layout: { hPos: number }) {
    const halfW = ui.playArea.width / 2

    ctx.save()
    ctx.font = '36px serif'
    const textMetrics = ctx.measureText(label)
    const textWidth = textMetrics.actualBoundingBoxRight - textMetrics.actualBoundingBoxLeft
    const textHeight = textMetrics.emHeightAscent + textMetrics.emHeightDescent
    const margin = textHeight * 0.5
    const padding = textHeight * 0.25
    const elWidth = textWidth + padding + padding
    const elHeight = textHeight + padding + padding
    layout.hPos += margin
    const left = halfW - (textWidth / 2) - padding
    const right = halfW + (textWidth / 2) + padding
    const top = layout.hPos - padding
    const bottom = layout.hPos + textHeight + padding

    const state = Gui.boxElement(ui, left, top, right - left, bottom - top)
    let textStyle = 'white'
    let bgStyle = 'green'
    switch (state) {
        case GuiStates.HOVERED:
            textStyle = 'black'
            bgStyle = 'green'
            break;
        case GuiStates.PRESSED:
            textStyle = 'white'
            bgStyle = '#0055FF'
            break;
    }

    if (state) {
        ctx.fillStyle = bgStyle
        ctx.fillRect(left, top, elWidth, elHeight)
    } else {
        ctx.strokeStyle = bgStyle
        ctx.lineWidth = 4
        ctx.strokeRect(left, top, elWidth, elHeight)
    }

    ctx.fillStyle = textStyle
    ctx.fillText(label, left + padding, top + textHeight + (padding * 0.5))

    ctx.restore()
    layout.hPos += elHeight

    return state === GuiStates.CLICKED
}
