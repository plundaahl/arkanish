import { BoundingBox } from "../../game-state/BoundingBox";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Prefab } from "../../game-state/Prefab";

export const EnemyBulletPrefab: Prefab = {
    id: 'EnemyBullet',
    spawn(gameState: GameState): Entity {
        const entity = World.spawnEntity(gameState)

        entity.flags |= EntityFlags.ROLE_ENEMY_BULLET | EntityFlags.DESTROY_AT_0_HP
        entity.collidesWith |= EntityFlags.ROLE_PLAYER
        entity.hurtBy |= EntityFlags.ROLE_PLAYER

        entity.colour = 'red'

        entity.flags |= EntityFlags.COLLIDER
        entity.colliderBbSrc = [
            BoundingBox.createCircleBb(0, 0, 8)
        ]

        return entity
    }
}
