import { Flag } from "./Flag";

const debugFlag = Flag.makeNumberFlagFactory()
export const DebugFlags = {
    DEV_MODE: debugFlag(),
}

export type DebugState = {
    debugFlags: number,
}

export const DebugState = {
    create(): DebugState {
        return { debugFlags: 0 }
    }
}
