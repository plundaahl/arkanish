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
    cursorState: CursorState,
}

export function mkUiState(): UiState {
    return {
        width: 0,
        height: 0,
        cursorActive: false,
        cursorX: 0,
        cursorY: 0,
        cursorState: CURSOR_IDLE,
    }
}

export interface Scene {
    update(time: number, canvas: CanvasRenderingContext2D, uiState: UiState): void
}
