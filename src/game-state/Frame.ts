export type FrameState = {
    running: boolean
    realTime: number
    gameTime: number
    frameLength: number
}

export const FrameState = {
    create: (time: number): FrameState => ({
        running: true,
        realTime: time,
        gameTime: 0,
        frameLength: 0,
    })
}
