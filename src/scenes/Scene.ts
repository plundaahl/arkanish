import { UiState } from "../ui-state"

export interface Scene {
    update(time: number, canvas: CanvasRenderingContext2D, uiState: UiState): void
}

// Debug function for rendering touches
export function renderTouches(ctx: CanvasRenderingContext2D, ui: UiState) {
    // Render Touches
    ctx.save()
    for (const touch of ui.touches) {
        ctx.lineWidth = 2
        ctx.strokeStyle = 'pink'
        ctx.strokeRect(touch.x - 50, touch.y - 50, 100, 100)
        ctx.font = '12px serif'
        ctx.fillStyle = 'white'
        ctx.fillText(`${touch.id} [${touch.x}, ${touch.y}] - [${touch.element}]`, touch.x + 50, touch.y - 50)
    }
    ctx.restore()
}
