export const RenderCommandTypes = {
    NULL: Symbol.for('NullRenderCommand'),
    CUSTOM: Symbol.for('CustomRenderCommand'),
}
type Shifted<T extends [CanvasRenderingContext2D, ...any[]]> = T extends [infer Ctx, ...infer Rest]
    ? Ctx extends CanvasRenderingContext2D
        ? Rest
        : []
    : never
export type CustomRenderCmd<T extends [CanvasRenderingContext2D, ...any[]]> = [
    typeof RenderCommandTypes.CUSTOM,
    number,
    (...args: T) => void,
    ...Shifted<T>
]

export type NullRenderCmd = [typeof RenderCommandTypes.NULL, number]

export type RenderCmd = CustomRenderCmd<any>
    | NullRenderCmd

export type RenderCommandBuffer = {
    commands: RenderCmd[],
    pool: RenderCmd[],
}

export const RenderCommandBuffer = {
    create: (): RenderCommandBuffer => {
        return ({
            commands: [],
            pool: [],
        })
    },
    reset: (buffer: RenderCommandBuffer): void => {
        buffer.pool.push(...buffer.commands)
        buffer.commands.length = 0
    },
    addCustomRenderCmd: <T extends [CanvasRenderingContext2D, ...any[]]>(
        buffer: RenderCommandBuffer,
        zDepth: number,
        func: (...args: T) => void,
        ...args: Shifted<T>
    ): void => {
        const cmd: any[] = buffer.pool.pop() || []
        cmd.length = 0
        cmd.push(RenderCommandTypes.CUSTOM, zDepth, func, ...args)
        buffer.commands.push(cmd as any)
    },
    isCustomRenderCmd: (cmd: RenderCmd): cmd is CustomRenderCmd<any> => cmd[0] === RenderCommandTypes.CUSTOM,
}
