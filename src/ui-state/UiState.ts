import { GameState } from "../game-state/GameState"
import { AABB, BoundingBox } from "../game-state/BoundingBox"

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
    playArea: AABB
}

export const UiState = {
    create: (): UiState => ({
        width: 0,
        height: 0,
        cursorActive: false,
        cursorX: 0,
        cursorY: 0,
        cursorState: CURSOR_IDLE,
        touches: [],
        playArea: BoundingBox.createAabb(0, 0, 0, 0)
    }),
    canvasXToGameX: (gameState: GameState, uiState: UiState, x: number): number => {
        return ((x - uiState.playArea.left)
            * gameState.playArea.width / uiState.playArea.width)
            + gameState.playArea.left
    },
    canvasYToGameY: (gameState: GameState, uiState: UiState, y: number): number => {
        return ((y - uiState.playArea.top)
            * gameState.playArea.height / uiState.playArea.height)
            + gameState.playArea.top
    },
    gameXToCanvasX: (gameState: GameState, uiState: UiState, x: number): number => {
        return ((x - gameState.playArea.left)
            * uiState.playArea.width / gameState.playArea.width)
            + uiState.playArea.left
    },
    gameYToCanvasY: (gameState: GameState, uiState: UiState, y: number): number => {
        return ((y - gameState.playArea.top)
            * uiState.playArea.height / gameState.playArea.height)
            + uiState.playArea.top
    },
}
