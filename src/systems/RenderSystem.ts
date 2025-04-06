import { Flag } from "../game-state/Flag";
import { RenderCmd, RenderCommandBuffer } from "../RenderCommand";
import { EntityFlags, EntityStates } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";
import { PlayerScript } from "../scripts/PlayerScript";
import { BoundingBoxTypes } from "../game-state/BoundingBox";
import { UiState } from "scenes/Scene";

const PLAYER_SCALE = 2
const PLAYER_HEIGHT_HALF = PLAYER_SCALE * 15
const PLAYER_WIDTH_HALF = PLAYER_SCALE * 10
const PLAYER_OFFSET = PLAYER_HEIGHT_HALF / 2

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
                            entity.posZ,
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
                            entity.posZ,
                            renderCircle,
                            entity.colour || 'white',
                            state.collidedEntities.has(entity.id),
                            box.x,
                            box.y,
                            box.r,
                        )
                    }
                }
            }

            if (entity.id === state.playerId) {
                RenderCommandBuffer.addCustomRenderCmd(
                    gameBuffer,
                    entity.posZ + 1,
                    renderPlayer,
                    entity.scriptState === PlayerScript.INVULNERABLE,
                    entity.scriptState === PlayerScript.DYING,
                    entity.posX,
                    entity.posY,
                )
            }
        }

        // Sort buffers
        uiBuffer.commands.sort(renderCmdsByZDepth)
        gameBuffer.commands.sort(renderCmdsByZDepth)

        
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

function renderPlayer(ctx: CanvasRenderingContext2D, invulnerable: boolean, dying: boolean, posX: number, posY: number) {
    ctx.save()
    ctx.beginPath()

    ctx.moveTo(posX, posY - PLAYER_HEIGHT_HALF - PLAYER_OFFSET)
    ctx.lineTo(posX - PLAYER_WIDTH_HALF, posY + PLAYER_HEIGHT_HALF - PLAYER_OFFSET)
    ctx.lineTo(posX, posY + (PLAYER_HEIGHT_HALF / 2) - PLAYER_OFFSET)
    ctx.lineTo(posX + PLAYER_WIDTH_HALF, posY + PLAYER_HEIGHT_HALF - PLAYER_OFFSET)
    ctx.closePath()

    if (invulnerable) {
        ctx.lineWidth = 2
        ctx.strokeStyle = 'red'
        ctx.stroke()
    } else {
        ctx.fillStyle = dying
            ? 'white'
            : 'red'
        ctx.fill()
    }
    
    ctx.restore()
}