import { RenderCommandBuffer } from "../../RenderCommand"
import { Gui, GuiStates, UiState } from "../../ui-state"
import { theme } from "./style"
import { renderBox, RenderFlags, renderText } from "../../systems"

const TEXT_SIZE = 36

export function textButton(
    buffer: RenderCommandBuffer,
    label: string,
    ui: UiState,
    w: number,
    layout: { hPos: number }
) {
    const halfW = ui.playArea.width / 2

    const textWidth = w
    const textHeight = TEXT_SIZE
    const margin = textHeight * 0.5
    const padding = textHeight * 0.25
    const elWidth = textWidth + padding + padding
    const elHeight = textHeight + padding + padding
    const left = halfW - (textWidth / 2) - padding
    const top = layout.hPos + margin

    layout.hPos += elHeight + margin

    theme.button.active

    const state = Gui.boxElement(ui, left, top, elWidth, elHeight)

    let style = theme.button.idle
    if (state === GuiStates.HOVERED) {
        style = theme.button.hot
    } else if (state === GuiStates.PRESSED) {
        style = theme.button.active
    }

    let textStyle = style.glyph
    let bgStyle = style.bg
    let outlineStyle = style.outline

    RenderCommandBuffer.addCustomRenderCmd(
        buffer, 1001, renderBox, left, top, elWidth, elHeight,
        bgStyle, RenderFlags.FILL
    )
    RenderCommandBuffer.addCustomRenderCmd(
        buffer, 1002, renderBox, left, top, elWidth, elHeight,
        outlineStyle, RenderFlags.LINE_THICK,
    )
    RenderCommandBuffer.addCustomRenderCmd(
        buffer, 1002, renderText, [label],
        left + (elWidth * 0.5), top + 2 + (elHeight * 1),
        RenderFlags.ALIGN_X_CENTER | RenderFlags.ALIGN_Y_CENTER,
        textStyle, '36px serif'
    )

    return state === GuiStates.CLICKED
}