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
                            entity.colour || 'white',
                            state.collidedEntities.has(entity.id),
                            box.left,
                            box.top,
                            box.width,
                            box.height,
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
        renderStarBackground(ctx, state.time, ui)

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

export function renderBox(ctx: CanvasRenderingContext2D, style: string, fill: boolean, x: number, y: number, w: number, h: number) {
    ctx.save()
    ctx.lineWidth = 2

    if (fill) {
        ctx.fillStyle = style
        ctx.fillRect(x, y, w, h)
    } else {
        ctx.strokeStyle = style
        ctx.strokeRect(x, y, w, h)
    }

    ctx.restore()
}

const FULL_CRICLE = 2 * Math.PI
export function renderCircle(ctx: CanvasRenderingContext2D, style: string, fill: boolean, x: number, y: number, r: number, opacity: number = 1) {
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