export const CURSOR_IDLE = 'IDLE'
export const CURSOR_DOWN = 'DOWN'
export const CURSOR_CLICK = 'CLICK'

export type CursorState = typeof CURSOR_IDLE | typeof CURSOR_DOWN | typeof CURSOR_CLICK

export interface UiState {
    width: number
    height: number
    cursorActive: boolean
    cursorX: number
    cursorY: number
    cursorState: CursorState
    touches: {
        x: number
        y: number
        offsetX: number
        offsetY: number
        id: number
        state: CursorState
        element: number
    }[]
}

export function mkUiState(): UiState {
    return {
        width: 0,
        height: 0,
        cursorActive: false,
        cursorX: 0,
        cursorY: 0,
        cursorState: CURSOR_IDLE,
        touches: [],
    }
}

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
