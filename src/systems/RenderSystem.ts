import { Flag } from "../game-state/Flag";
import { RenderCmd, RenderCommandBuffer } from "../RenderCommand";
import { EntityFlags, EntityStates } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";
import { BoundingBoxTypes } from "../game-state/BoundingBox";
import { UiState } from "../ui-state";
import { Vector2 } from "../game-state/Vector";

export const RenderSystem = {
    render: (state: GameState, ui: UiState, gameBuffer: RenderCommandBuffer, uiBuffer: RenderCommandBuffer, ctx: CanvasRenderingContext2D) => {
        // Prepare render commands
        for (const entity of state.entities) {
            if (entity.state === EntityStates.ALIVE
                && Flag.hasBigintFlags(entity.flags, EntityFlags.COLLIDER)
            ) {
                for (const box of entity.colliderBbTransform) {
                    if (box.type === BoundingBoxTypes.AABB) {
                        RenderCommandBuffer.addCustomRenderCmd(
                            gameBuffer,
                            entity.posZG,
                            renderBox,
                            box.left,
                            box.top,
                            box.width,
                            box.height,
                            entity.colour || 'white',
                            state.collidedEntities.has(entity.id) ? RenderFlags.FILL : 0,
                        )
                    } else if (box.type === BoundingBoxTypes.CIRCLE) {
                        RenderCommandBuffer.addCustomRenderCmd(
                            gameBuffer,
                            entity.posZG,
                            renderCircle,
                            entity.colour || 'white',
                            state.collidedEntities.has(entity.id),
                            box.x,
                            box.y,
                            box.r,
                        )
                    } else if (box.type === BoundingBoxTypes.CONVEX_POLY) {
                        RenderCommandBuffer.addCustomRenderCmd(
                            gameBuffer,
                            entity.posZG,
                            renderPoly,
                            entity.colour || 'white',
                            state.collidedEntities.has(entity.id) || entity.id === state.playerId,
                            1,
                            box.vertexes,
                        )
                    }
                }
            }
        }

        // Sort buffers
        uiBuffer.commands.sort(renderCmdsByZDepth)
        gameBuffer.commands.sort(renderCmdsByZDepth)

        // NOTE: Rendering relies on play area projection calculation. See InputSystem.

        // DRAW BACKGROUND
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        renderStarBackground(ctx, state.gameTime, ui)

        // DRAW GAME VIEW
        ctx.save()
        renderViewBox(ctx, ui)
        const scale = ui.playArea.width / state.playArea.width
        ctx.translate(ui.playArea.left, ui.playArea.top)
        ctx.scale(scale, scale)
        ctx.translate(-state.playArea.left, -state.playArea.top)
        for (const command of gameBuffer.commands) {
            if (RenderCommandBuffer.isCustomRenderCmd(command)) {
                const [_, __, func, ...rest] = command
                func(ctx, ...rest)
            }
        }
        ctx.restore()

        // DRAW UI VIEW
        ctx.save()
        ctx.translate(ui.playArea.left, ui.playArea.top)
        for (const command of uiBuffer.commands) {
            if (RenderCommandBuffer.isCustomRenderCmd(command)) {
                const [_, __, func, ...rest] = command
                func(ctx, ...rest)
            }
        }
        ctx.restore()

        // Clear command buffers
        RenderCommandBuffer.reset(gameBuffer)
        RenderCommandBuffer.reset(uiBuffer)
    },
}

function renderCmdsByZDepth(a: RenderCmd, b: RenderCmd) {
    return a[1] - b[1]
}

function renderViewBox(ctx: CanvasRenderingContext2D, ui: UiState) {
    const { left, top, width, height } = ui.playArea

    // Darken stars
    ctx.save()
    ctx.fillStyle = 'black'
    ctx.globalAlpha = 0.7
    ctx.fillRect(0, 0, left, ui.height)
    ctx.fillRect(left + width, 0, left, ui.height)
    ctx.fillRect(left, 0, width, top)
    ctx.fillRect(left, top + height, width, top)
    ctx.restore()

    // White overlay
    ctx.save()
    ctx.fillStyle = 'white'
    ctx.globalAlpha = 0.1
    ctx.fillRect(0, 0, left, ui.height)
    ctx.fillRect(left + width, 0, left, ui.height)
    ctx.fillRect(left, 0, width, top)
    ctx.fillRect(left, top + height, width, top)
    ctx.restore()

    // Clip game objects to play area
    ctx.beginPath()
    ctx.moveTo(left, top)
    ctx.lineTo(left + width, top)
    ctx.lineTo(left + width, top + height)
    ctx.lineTo(left, top + height)
    ctx.closePath()
    ctx.clip()
}

const renderFlag = Flag.makeNumberFlagFactory()
export const RenderFlags = {
    FILL: renderFlag(),
    LINE_THICK: renderFlag(),
    ALIGN_X_LEFT: 0,
    ALIGN_X_CENTER: renderFlag(),
    ALIGN_X_RIGHT: renderFlag(),
    ALIGN_Y_TOP: 0,
    ALIGN_Y_CENTER: renderFlag(),
    ALIGN_Y_BOTTOM: renderFlag(),
}

export function positionX(x: number, w: number, flags: number): number {
    if (flags & RenderFlags.ALIGN_X_CENTER) {
        return x - (w * 0.5)
    }
    if (flags & RenderFlags.ALIGN_X_RIGHT) {
        return x - w
    }
    return x
}

export function positionY(y: number, h: number, flags: number): number {
    if (flags & RenderFlags.ALIGN_Y_CENTER) {
        return y - (h * 0.5)
    }
    if (flags & RenderFlags.ALIGN_Y_BOTTOM) {
        return y - h
    }
    return y
}

function lineWidth(flags: number) {
    if (flags & RenderFlags.LINE_THICK) {
        return 4
    }
    return 2
}

export function renderBox(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    style: string,
    flags: number = 0,
) {
    ctx.save()

    const actualX = positionX(x, w, flags)
    const actualY = positionY(y, h, flags)

    if (flags & RenderFlags.FILL) {
        ctx.fillStyle = style
        ctx.fillRect(actualX, actualY, w, h)
    } else {
        ctx.lineWidth = lineWidth(flags)
        ctx.strokeStyle = style
        ctx.strokeRect(actualX, actualY, w, h)
    }

    ctx.restore()
}

const FULL_CRICLE = 2 * Math.PI
export function renderCircle(
    ctx: CanvasRenderingContext2D,
    style: string,
    fill: boolean,
    x: number,
    y: number,
    r: number,
    opacity: number = 1
) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, Math.abs(r), 0, FULL_CRICLE)
    ctx.closePath()

    ctx.globalAlpha = opacity
    if (fill) {
        ctx.fillStyle = style
        ctx.fill()
    } else {
        ctx.lineWidth = 2
        ctx.strokeStyle = style
        ctx.stroke()
    }
    ctx.restore()
}

export function renderPoly(ctx: CanvasRenderingContext2D, style: string, fill: boolean, opacity: number, vertexes: Vector2[]) {
    if (vertexes.length < 2) {
        return
    }
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(...vertexes[0])
    for (let i = 1; i < vertexes.length; i++) {
        ctx.lineTo(...vertexes[i])
    }
    ctx.closePath()

    ctx.globalAlpha = opacity
    if (fill) {
        ctx.fillStyle = style
        ctx.fill()
    } else {
        ctx.lineWidth = 2
        ctx.strokeStyle = style
        ctx.stroke()
    }

    ctx.restore()
}

const BEAM_LENGTH = 4000
export function renderBeam(
    ctx: CanvasRenderingContext2D, style: string, fill: boolean,
    opacity: number, x: number, y: number, w: number, r: number
) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(r)

    const halfWidth = w * 0.5

    ctx.globalAlpha = opacity
    if (fill) {
        ctx.fillStyle = style
        ctx.fillRect(0, 0 - halfWidth, BEAM_LENGTH, w)
    } else {
        ctx.strokeStyle = style
        ctx.lineWidth = 2
        ctx.strokeRect(0, 0 - halfWidth, BEAM_LENGTH, w)
    }
    ctx.restore()
}

export function renderText(
    ctx: CanvasRenderingContext2D,
    text: string[],
    x: number,
    y: number,
    flags: number = 0,
    style: string = 'white',
    font: string = '20px serif',
) {
    ctx.save()
    ctx.font = font
    ctx.fillStyle = style

    const baseMetrics = ctx.measureText('')
    const lineHeight = baseMetrics.emHeightAscent + baseMetrics.emHeightDescent
    const totalHeight = lineHeight * text.length

    let pos = positionY(y, totalHeight, flags)

    for (const line of text) {
        const textMetrics = ctx.measureText(line)
        const lineHeight = textMetrics.emHeightAscent + textMetrics.emHeightDescent
        ctx.fillText(
            line,
            positionX(x, textMetrics.width, flags),
            pos,
        )
        pos += lineHeight
    }

    ctx.restore()
}

const STAR_TIME_SCALE = 1 / 5000
function renderStarBackground(ctx: CanvasRenderingContext2D, time: number, ui: UiState): void {
    const { width, height } = ui

    ctx.save()

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = 'white'

    for (let i = 0; i < 100; i++) {
        const xScaler = (i * i) + (i / 3)
        const yScaler = (i * i * i) - (i / 73)
        const speedScaler = ((((i + xScaler + yScaler) % 10) / 10) + 0.5)
        const sizeScaler = (speedScaler * 2) + 0.1
        const xPos = (1.37 * xScaler * width) % width
        const yPos = ((0.83 * yScaler * height) + (time * speedScaler * STAR_TIME_SCALE * height)) % height
        ctx.fillRect(xPos, yPos, sizeScaler, sizeScaler)
    }

    ctx.restore()
}