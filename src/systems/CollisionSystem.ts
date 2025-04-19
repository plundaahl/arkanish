import { Flag } from '../game-state/Flag'
import { EntityFlags, EntityStates, World } from '../game-state/Entity'
import { BoundingBox } from '../game-state/BoundingBox'
import { GameEventBuffer } from '../game-state/GameEvent'
import { GameState } from '../game-state/GameState'

export const CollisionSystem = {
    run: (gameState: GameState): void => {
        gameState.collidedEntities.clear()

        const entities = gameState.entities

        for (let i = 0; i < entities.length; i++) {
            const entityI = entities[i]
            if (!(entityI.state === EntityStates.ALIVE && Flag.hasBigintFlags(entityI.flags, EntityFlags.COLLIDER))) {
                continue
            }
            for (let j = i + 1; j < entities.length; j++) {
                const entityJ = entities[j]
                if (!(entityJ.state === EntityStates.ALIVE && Flag.hasBigintFlags(entityJ.flags, EntityFlags.COLLIDER))) {
                    continue
                }

                const entityIListens = (entityI.collidesWith & entityJ.flags)
                const entityJListens = (entityJ.collidesWith & entityI.flags)

                if (!(entityIListens || entityJListens)) {
                    continue
                }

                boundingBoxCheck: for (const a of entityI.colliderBbTransform) {
                    for (const b of entityJ.colliderBbTransform) {
                        if (BoundingBox.intersects(a, b)) {
                            if (entityIListens) {
                                gameState.collidedEntities.add(entityI.id)
                                GameEventBuffer.addCollisionEvent(gameState, entityI.id, entityJ.id)
                            }
                            if (entityJListens) {
                                gameState.collidedEntities.add(entityJ.id)
                                GameEventBuffer.addCollisionEvent(gameState, entityJ.id, entityI.id)
                            }
                            break boundingBoxCheck;
                        }
                    }
                }
            }
        }
    },
}
