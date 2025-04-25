import { Flag } from "../game-state/Flag";

const buttonFlag = Flag.makeNumberFlagFactory()
export const Buttons = Object.freeze({
    MENU: buttonFlag(),
})

export type ButtonState = {
    buttonsDown: number,
    prevButtonsDown: number,
}

export const ButtonState = {
    create(): ButtonState {
        return {
            buttonsDown: 0,
            prevButtonsDown: 0,
        }
    },
    down(state: ButtonState, button: number): boolean {
        return !!(state.buttonsDown & button)
    },
    up(state: ButtonState, button: number): boolean {
        return !(state.buttonsDown & button)
    },
    pressed(state: ButtonState, button: number): boolean {
        return !!(!(state.buttonsDown & button) && (state.prevButtonsDown & button))
    },
}
