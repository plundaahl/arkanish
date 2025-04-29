import { UiState } from "../../ui-state"

export function mainMenuLabel(
    text: string,
    font: string,
    style: string,
    ctx: CanvasRenderingContext2D,
    ui: UiState,
    layout: { hPos: number },
    margin: number = 0
) {
    const halfW = ui.playArea.width / 2
    ctx.save()
    ctx.font = font
    ctx.fillStyle = style
    const textMetrics = ctx.measureText(text)
    ctx.fillText(text, halfW - (textMetrics.width / 2), layout.hPos + margin)
    layout.hPos += textMetrics.emHeightAscent + textMetrics.emHeightDescent + (margin * 2)
    ctx.restore()
}