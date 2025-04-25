import { GameState } from "../game-state/GameState"
import { AABB, BoundingBox } from "../game-state/BoundingBox"
import { ButtonState } from "./ButtonState"
import { GuiState } from "./GuiState"
import { PointerState } from "./PointerState"
import { TouchState } from "./TouchState"
import { ScreenState } from "./ScreenState"

export type UiState = (
    ScreenState
    & ButtonState
    & GuiState
    & PointerState
    & TouchState
)

export const UiState = {
    create: (): UiState => ({
        ...ScreenState.create(),
        ...TouchState.create(),
        ...PointerState.create(),
        ...ButtonState.create(),
        ...GuiState.create(),
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
