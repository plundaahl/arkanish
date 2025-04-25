import { CursorState, CURSOR_IDLE } from './Cursor'

export type PointerState = {
    cursorActive: boolean
    cursorX: number
    cursorY: number
    cursorState: CursorState
    cursorElementId: number
}

export const PointerState = {
    create(): PointerState {
        return {
            cursorActive: false,
            cursorX: 0,
            cursorY: 0,
            cursorState: CURSOR_IDLE,
            cursorElementId: 0,
        }
    }
}
