import { Vector2 } from "../../game-state/Vector";
import { ExtraMath } from "../../Math";
import { BoundingBox } from "../../game-state/BoundingBox";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { Prefab } from "../../game-state/Prefab";

const CIRCLE = Math.PI * 2

export const AsteroidHitboxPrefab: Prefab = {
    id: 'AsteroidHitbox',
    spawn(gameState, parent): Entity {
        const hitbox = World.spawnEntity(gameState, parent)

        hitbox.flags |= EntityFlags.COLLIDER
        hitbox.collidesWith = EntityFlags.ROLE_PLAYER | EntityFlags.ROLE_PLAYER_BULLET
        hitbox.flags |= EntityFlags.ROLE_OBSTACLE
        hitbox.flags |= EntityFlags.DESTROY_AT_0_HP
        hitbox.hurtBy |= EntityFlags.ROLE_PLAYER_BULLET
        hitbox.colour = 'red'

        const cornerRoll = Math.round(ExtraMath.rollBetween(0, 2))
        const numCorners = 5 + (cornerRoll * 2)

        const vertexes: Vector2[] = []
        for (let i = 0; i < numCorners; i++) {
            vertexes.push(Vector2.createFromAngle(CIRCLE * (i + 1) / numCorners, 20))
        }
        hitbox.colliderBbSrc = [BoundingBox.createConvexPolyBb(...vertexes)]

        return hitbox
    },
}
