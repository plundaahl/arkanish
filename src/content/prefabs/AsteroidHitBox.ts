import { Vector2 } from "../../game-state/Vector";
import { ExtraMath } from "../../Math";
import { BoundingBox } from "../../game-state/BoundingBox";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { Prefab, PrefabParameters } from "../../game-state/Prefab";

const CIRCLE = Math.PI * 2

export interface AsteroidHitboxParameters extends PrefabParameters {
    minCorners: number
    maxCorners: number
}

export const AsteroidHitboxPrefab: Prefab<AsteroidHitboxParameters> = {
    id: 'AsteroidHitbox',
    spawn(gameState, parent, parameters): Entity {
        const minCorners = parameters?.minCorners || 4
        const maxCorners = parameters?.maxCorners || 8

        const hitbox = World.spawnEntity(gameState, parent)

        hitbox.flags |= EntityFlags.COLLIDER
        hitbox.flags |= EntityFlags.ROLE_OBSTACLE
        hitbox.collidesWith = EntityFlags.ROLE_PLAYER | EntityFlags.ROLE_PLAYER_BULLET
        hitbox.colour = 'red'

        const numCorners = (Math.round(
            ExtraMath.rollBetween(minCorners, maxCorners) / 2
        ) * 2) + 1

        const vertexes: Vector2[] = []
        for (let i = 0; i < numCorners; i++) {
            vertexes.push(Vector2.createFromAngle(CIRCLE * (i + 1) / numCorners, 20))
        }
        hitbox.colliderBbSrc = [BoundingBox.createConvexPolyBb(...vertexes)]

        hitbox.variation = Math.floor(Math.random() * 255)

        return hitbox
    },
}
