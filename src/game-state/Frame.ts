export type FrameState = {
    time: number
    frameLength: number
}

export const FrameState = {
    create: (time: number): FrameState => ({
        time,
        frameLength: 0,
    })
}
