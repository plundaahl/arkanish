import { CursorState } from './Cursor'

export type TouchState = {
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

export const TouchState = {
    create(): TouchState {
        return { touches: [] }
    }
}
