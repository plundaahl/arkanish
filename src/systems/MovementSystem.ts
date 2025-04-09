import { Flag } from "../game-state/Flag";
import { BoundingBox } from "../game-state/BoundingBox";
import { EntityFlags, EntityStates } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";
import { GameEventBuffer } from "../game-state/GameEvent";
import { modulo } from "../game-state/Vector";

const MS_PER_SEC = 1000
const FULL_CIRCLE = Math.PI * 2

export const MovementSystem = {
    run: (state: GameState) => {
        const deltaT = state.frameLength

        // Move entities
        for (let i = 0; i < state.entities.length; i++) {
            const entity = state.entities[i]
            if (entity.state === EntityStates.ALIVE) {
                entity.posY += (entity.velY * deltaT) / MS_PER_SEC
                entity.posX += (entity.velX * deltaT) / MS_PER_SEC
                entity.posR += modulo((entity.velR * deltaT) / MS_PER_SEC, FULL_CIRCLE)
            }
        }

        // Constrain entities to play area
        const playAreaLeft = state.playArea.left
        const playAreaRight = state.playArea.width + state.playArea.left
        const playAreaTop = state.playArea.top
        const playAreaBottom = state.playArea.top + state.playArea.height

        for (let i = 0; i < state.entities.length; i++) {
            const entity = state.entities[i]
            if (entity.state !== EntityStates.ALIVE) {
                continue
            }

            const left = BoundingBox.leftOf(...entity.colliderBbSrc)
            const right = BoundingBox.rightOf(...entity.colliderBbSrc)
            const top = BoundingBox.topOf(...entity.colliderBbSrc)
            const bottom = BoundingBox.bottomOf(...entity.colliderBbSrc)

            if (Flag.hasBigintFlags(entity.flags, EntityFlags.CONSTRAIN_TO_PLAY_SPACE)) {
                entity.posX = clamp(playAreaLeft - left, entity.posX, playAreaRight - right)
                entity.posY = clamp(playAreaTop - top, entity.posY, playAreaBottom - bottom)
            }

            if (Flag.hasBigintFlags(entity.flags, EntityFlags.BOUNCE_IN_PLAY_SPACE)) {
                let bounce = false
                const leftOverlap = entity.posX + left - playAreaLeft
                if (leftOverlap < 0) {
                    entity.posX -= leftOverlap
                    entity.velX *= -1
                    bounce = true
                }
                const rightOverlap = entity.posX + right - playAreaRight
                if (rightOverlap > 0) {
                    entity.posX -= rightOverlap
                    entity.velX *= -1
                    bounce = true
                }
                const topOverlap = entity.posY + top - playAreaTop
                if (topOverlap < 0) {
                    entity.posY -= topOverlap
                    entity.velY *= -1
                    bounce = true
                }
                const bottomOverlap = entity.posY + bottom - playAreaBottom
                if (bottomOverlap > 0) {
                    entity.posY -= bottomOverlap
                    entity.velY *= -1
                    bounce = true
                }
                if (bounce) {
                    GameEventBuffer.addBounceEvent(state, entity.id)
                }
            }
        }

        // Update transforms
        for (const entity of state.entities) {
            if (entity.state === EntityStates.ALIVE) {
                for (let i = 0; i < entity.colliderBbSrc.length; i++) {
                    const src = entity.colliderBbSrc[i]
                    const dest = entity.colliderBbTransform[i]
                    BoundingBox.transform(src, dest, entity.posX, entity.posY, entity.posR)
                } 
            }
        }
    }
}

function clamp(min: number, current: number, max: number): number {
    return Math.min(Math.max(min, current), max)
}