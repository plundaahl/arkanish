import { RenderCommandBuffer } from "RenderCommand"
import { GameState } from "../game-state/GameState"
import { CURSOR_CLICK, CURSOR_DOWN } from "./Cursor"
import { PointerState } from "./PointerState"
import { ScreenState } from "./ScreenState"
import { TouchState } from "./TouchState"
import { UiState } from "./UiState"

export const GuiStates = {
    NONE: 0,
    HOVERED: 1,
    CLICKED: 2,
}

export type GuiState = {
    guiElementCounter: number,
    guiController: string,
}

export interface GuiController<T extends string> {
    id: T
    update(gameState: GameState, uiState: UiState, buffer: RenderCommandBuffer): void
}

type InterfaceState = GuiState & PointerState & TouchState & ScreenState

export const GuiState = {
    create(): GuiState {
        return {
            guiElementCounter: 0,
            guiController: '',
        }
    },
}

export const Gui = {
    startController(ui: InterfaceState, controller: string): void {
        ui.guiController = controller
    },
    boxElement(ui: InterfaceState, x: number, y: number, w: number, h: number): number {
        const cursorActive = ui.cursorActive
        const cursorX = ui.cursorX
        const cursorY = ui.cursorY
        const elementId = ++ui.guiElementCounter

        const left = x + ui.playArea.left
        const top = y + ui.playArea.top
        const right = left + w
        const bottom = top + h

        let clicked = false
        let hovered = false
        if (cursorActive
            && left <= cursorX && cursorX <= right
            && top <= cursorY && cursorY <= bottom
        ) {
            hovered = true
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

        if (clicked || tapped) {
            return GuiStates.CLICKED
        } else if (hovered) {
            return GuiStates.HOVERED
        } else {
            return GuiStates.NONE
        }
    },
}

const controllerRegistry: { [Id in string]: GuiController<string> } = {}
export const GuiControllerRegistry = {
    registerGuiControllers(...controllers: GuiController<string>[]): void {
        for (const controller of controllers) {
            if (controllerRegistry[controller.id]) {
                if (Object.is(controllerRegistry[controller.id], controller)) {
                    console.warn(`GuiController with ID [${controller.id}] was registered multiple times.  This is redundant and probably a bug.`)
                } else {
                    throw new Error(`Attempted to register GuiController with ID [${controller.id}], but that ID is already registered.`)
                }
            }
            controllerRegistry[controller.id] = controller
        }
    },
    getController<I extends string>(id: I): GuiController<I> {
        const controller = controllerRegistry[id]
        if (!controller) {
            throw new Error(`No GuiController registered with ID [${id}].`)
        }
        return controller as GuiController<I>
    },
}
