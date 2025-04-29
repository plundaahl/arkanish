import { GameState } from "../../game-state/GameState"
import { Gui, GuiStates, UiState } from "../../ui-state"

export function mainMenuButton(
    label: string,
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    ui: UiState,
    layout: { hPos: number }
) {
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
