import { Flag } from "../game-state/Flag";
import { RenderCommandBuffer } from "../RenderCommand";
import { EntityFlags, EntityStates } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";
import { PlayerScript } from "../scripts/PlayerScript";
import { BoundingBoxTypes } from "../game-state/BoundingBox";

const PLAYER_SCALE = 2
const PLAYER_HEIGHT_HALF = PLAYER_SCALE * 15
const PLAYER_WIDTH_HALF = PLAYER_SCALE * 10
const PLAYER_OFFSET = PLAYER_HEIGHT_HALF / 2

export const RenderSystem = {
    render: (state: GameState, buffer: RenderCommandBuffer, ctx: CanvasRenderingContext2D) => {
        // Prepare render commands
        for (const entity of state.entities) {
            if (entity.state === EntityStates.ALIVE
                && Flag.hasBigintFlags(entity.flags, EntityFlags.COLLIDER)
            ) {
                for (const box of entity.colliderBbTransform) {
                    if (box.type === BoundingBoxTypes.AABB) {
                        RenderCommandBuffer.addCustomRenderCmd(
                            buffer,
                            entity.posZ,
                            renderBox,
                            entity.colour || 'white',
                            state.collidedEntities.has(entity.id),
                            box.left,
                            box.top,
                            box.width,
                            box.height,
                        )
                    }
                }
            }

            if (entity.id === state.playerId) {
                RenderCommandBuffer.addCustomRenderCmd(
                    buffer,
                    entity.posZ + 1,
                    renderPlayer,
                    entity.scriptState === PlayerScript.INVULNERABLE,
                    entity.scriptState === PlayerScript.DYING,
                    entity.posX,
                    entity.posY,
                )
            }
        }

        // Todo: sort render commands (by z-depth)
        buffer.commands.sort((a, b) => a[1] - b[1])

        // Execute render commands
        for (const command of buffer.commands) {
            if (RenderCommandBuffer.isCustomRenderCmd(command)) {
                const [_, __, func, ...rest] = command
                func(ctx, ...rest)
            }
        }

        // Clear buffer
        RenderCommandBuffer.reset(buffer)
    },
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