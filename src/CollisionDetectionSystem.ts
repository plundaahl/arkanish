import { World } from './World'
import { Flag } from './Flag'
import { EntityFlags } from './Entity'
import { BoundingBox } from './BoundingBox'

export type Collisions = {
    // Pairs of entity IDs: the listener, and the one that was collided with
    collisions: number[]
    collidedEntities: Set<number>
}

export const CollisionSystem = {
    makeState: (): Collisions => ({
        collisions: [],
        collidedEntities: new Set(),
    }),
    run: (world: World, collision: Collisions): void => {
        collision.collidedEntities.clear()
        collision.collisions.length = 0

        const entities = world.entities

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
                                collision.collidedEntities.add(entityI.id)
                                collision.collisions.push(entityI.id, entityJ.id)
                            }
                            if (entityJListens) {
                                collision.collidedEntities.add(entityJ.id)

                                collision.collisions.push(entityJ.id, entityI.id)
                            }
                        }
                    }
                }
            }
        }
    }
}
