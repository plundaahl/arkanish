import { Flag } from '../game-state/Flag'
import { EntityFlags, World } from '../game-state/Entity'
import { BoundingBox } from '../game-state/BoundingBox'
import { GameEventBuffer } from '../game-state/GameEvent'
import { GameState } from '../game-state/GameState'

export const CollisionSystem = {
    run: (gameState: GameState): void => {
        gameState.collidedEntities.clear()
        gameState.collisions.length = 0

        const entities = gameState.entities

        for (let i = 0; i < entities.length; i++) {
            const entityI = entities[i]
            if (!Flag.hasBigintFlags(entityI.flags, EntityFlags.ALIVE, EntityFlags.COLLIDER)) {
                continue
            }
            for (let j = i + 1; j < entities.length; j++) {
                const entityJ = entities[j]
                if (!Flag.hasBigintFlags(entityJ.flags, EntityFlags.ALIVE, EntityFlags.COLLIDER)) {
                    continue
                }

                const entityIListens = (entityI.collidesWith & entityJ.colliderGroup)
                const entityJListens = (entityJ.collidesWith & entityI.colliderGroup)

                if (!(entityIListens || entityJListens)) {
                    continue
                }

                for (const a of entityI.colliderBbTransform) {
                    for (const b of entityJ.colliderBbTransform) {
                        if (BoundingBox.intersects(a, b)) {
                            if (entityIListens) {
                                gameState.collidedEntities.add(entityI.id)
                                gameState.collisions.push(entityI.id, entityJ.id)
                                GameEventBuffer.addCollisionEvent(gameState, entityI.id, entityJ.id)
                            }
                            if (entityJListens) {
                                gameState.collidedEntities.add(entityJ.id)
                                gameState.collisions.push(entityJ.id, entityI.id)
                                GameEventBuffer.addCollisionEvent(gameState, entityJ.id, entityI.id)
                            }
                        }
                    }
                }
            }
        }
    },
    cleanup: (state: GameState) => {
        GameEventBuffer.clear(state)
    },
}
