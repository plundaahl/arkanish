import { CURSOR_CLICK, CURSOR_DOWN, CURSOR_IDLE } from "./Cursor"
import { PointerState } from "./PointerState"
import { ScreenState } from "./ScreenState"
import { TouchState } from "./TouchState"
import { UiState } from "./UiState"

export type GuiState = {
    guiElementCounter: number,
}

type InterfaceState = GuiState & PointerState & TouchState & ScreenState

export const GuiState = {
    create(): GuiState {
        return {
            guiElementCounter: 0,
        }
    },
    isBoxInteracted(ui: InterfaceState, x: number, y: number, w: number, h: number): boolean {
        const cursorActive = ui.cursorActive
        const cursorX = ui.cursorX
        const cursorY = ui.cursorY
        const elementId = ++ui.guiElementCounter

        const left = x + ui.playArea.left
        const top = y + ui.playArea.top
        const right = left + w
        const bottom = top + h

        let clicked = false
        if (cursorActive
            && left <= cursorX && cursorX <= right
            && top <= cursorY && cursorY <= bottom
        ) {
            if (ui.cursorState === CURSOR_DOWN) {
                ui.cursorElementId = elementId
            } else if (ui.cursorState === CURSOR_CLICK && ui.cursorElementId === elementId) {
                clicked = true
            }
        }

        let tapped = false
        for (const touch of ui.touches) {
            if (left <= touch.x && touch.x <= right && top <= touch.y && touch.y <= bottom) {
                // Touch complete click
                if (touch.element === elementId && touch.state === CURSOR_CLICK) {
                    tapped = true
                }
                // Touch begin click
                if (touch.element === 0 && touch.state === CURSOR_DOWN) {
                    touch.element = elementId
                }
            }
        }

        return clicked || tapped
    },
}
