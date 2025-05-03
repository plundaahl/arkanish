import { Flag } from "../game-state/Flag";
import { BoundingBox } from "../game-state/BoundingBox";
import { EntityFlags, EntityStates, World } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";
import { GameEventBuffer } from "../game-state/GameEvent";
import { Vector2 } from "../game-state/Vector";
import { ExtraMath } from "../Math";

const MS_PER_SEC = 1000
const FULL_CIRCLE = Math.PI * 2

const localVel: Vector2 = Vector2.createFromCoordinates(0, 0)
const vParent: Vector2 = Vector2.createFromCoordinates(0, 0)
const vChild: Vector2 = Vector2.createFromCoordinates(0, 0)

export const MovementSystem = {
    run: (state: GameState) => {
        const deltaT = state.frameLength
        const playAreaLeft = state.playArea.left
        const playAreaRight = state.playArea.width + state.playArea.left
        const playAreaTop = state.playArea.top
        const playAreaBottom = state.playArea.top + state.playArea.height

        for (let i = 0; i < state.entities.length; i++) {
            const entity = state.entities[i]
            if (entity.state <= EntityStates.SPAWNING) {
                continue
            }

            // Update velocities
            entity.posRL = ExtraMath.modulo(entity.posRL + ((entity.velRL * deltaT) / MS_PER_SEC), FULL_CIRCLE)

            if (entity.flags & EntityFlags.USE_INTERNAL_VELOCITY) {
                Vector2.setToAngleAndMag(localVel, entity.velAI, entity.velMI)
                Vector2.rotateBy(localVel, entity.posRL)
                entity.velXL = Vector2.xOf(localVel)
                entity.velYL = Vector2.yOf(localVel)
            }

            entity.posXL += (entity.velXL * deltaT) / MS_PER_SEC
            entity.posYL += (entity.velYL * deltaT) / MS_PER_SEC

            const parent = World.getEntity(state, entity.parent)
            // Constrain entities to play area
            if (!parent) {
                const left = BoundingBox.leftOf(...entity.colliderBbSrc)
                const right = BoundingBox.rightOf(...entity.colliderBbSrc)
                const top = BoundingBox.topOf(...entity.colliderBbSrc)
                const bottom = BoundingBox.bottomOf(...entity.colliderBbSrc)

                // Clamp to play space
                if (Flag.hasBigintFlags(entity.flags, EntityFlags.CONSTRAIN_TO_PLAY_SPACE)) {
                    entity.posXL = ExtraMath.clamp(playAreaLeft - left, entity.posXL, playAreaRight - right)
                    entity.posYL = ExtraMath.clamp(playAreaTop - top, entity.posYL, playAreaBottom - bottom)
                }

                // Bounce
                if (Flag.hasBigintFlags(entity.flags, EntityFlags.BOUNCE_IN_PLAY_SPACE)) {
                    let bounce = false
                    const leftOverlap = entity.posXL + left - playAreaLeft
                    if (leftOverlap < 0) {
                        entity.posXL -= leftOverlap
                        entity.velXL *= -1
                        bounce = true
                    }
                    const rightOverlap = entity.posXL + right - playAreaRight
                    if (rightOverlap > 0) {
                        entity.posXL -= rightOverlap
                        entity.velXL *= -1
                        bounce = true
                    }
                    const topOverlap = entity.posYL + top - playAreaTop
                    if (topOverlap < 0) {
                        entity.posYL -= topOverlap
                        entity.velYL *= -1
                        bounce = true
                    }
                    const bottomOverlap = entity.posYL + bottom - playAreaBottom
                    if (bottomOverlap > 0) {
                        entity.posYL -= bottomOverlap
                        entity.velYL *= -1
                        bounce = true
                    }
                    if (bounce) {
                        GameEventBuffer.addBounceEvent(state, entity.id)
                    }
                }
            }

            // Update transforms
            if (!parent) {
                // Parents
                entity.posXG = entity.posXL
                entity.posYG = entity.posYL
                entity.posRG = entity.posRL
                entity.velXG = entity.velXL
                entity.velYG = entity.velYL
            } else {
                // Children
                Vector2.setToCoordinates(vParent, parent.posXG, parent.posYG)
                Vector2.setToCoordinates(vChild, entity.posXL, entity.posYL)
                Vector2.rotateBy(vChild, parent.posRG)
                Vector2.addCoordinates(vChild, parent.posXG, parent.posYG)

                entity.posXG = Vector2.xOf(vChild)
                entity.posYG = Vector2.yOf(vChild)
                entity.posZG = entity.posZL + parent.posZG
                entity.posRG = entity.posRL + parent.posRG

                Vector2.setToCoordinates(vParent, parent.velXG, parent.velYG)
                Vector2.setToCoordinates(vChild, entity.velXL, entity.velYL)
                Vector2.rotateBy(vChild, parent.posRG)
                Vector2.addCoordinates(vChild, parent.velXG, parent.velYG)

                entity.velXG = Vector2.xOf(vChild)
                entity.velYG = Vector2.yOf(vChild)
            }

            // Apply transforms to bounding boxes
            for (let i = 0; i < entity.colliderBbSrc.length; i++) {
                const src = entity.colliderBbSrc[i]
                const dest = entity.colliderBbTransform[i] || BoundingBox.clone(src)
                entity.colliderBbTransform[i] = dest
                BoundingBox.transform(src, dest, entity.posXG, entity.posYG, entity.posRG)
            }
        }
    }
}
