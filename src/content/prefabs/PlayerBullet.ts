import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { Prefab } from "../../game-state/Prefab";
import { BoundingBox } from "../../game-state/BoundingBox";
import { BulletScriptHandler } from "../scripts";
import { Script } from "../../game-state/Script";

const PLAYER_BULLET_SPEED = -500

export const PlayerBulletPrefab: Prefab = {
    id: "PlayerBullet",
        spawn(gameState, parent): Entity {
        const bullet = World.spawnEntity(gameState, parent)
        bullet.flags |= EntityFlags.ROLE_PLAYER_BULLET

        bullet.velYL = PLAYER_BULLET_SPEED

        bullet.flags |= EntityFlags.COLLIDER
        bullet.flags |= EntityFlags.DESTROY_AT_0_HP
        bullet.hp = 1
        bullet.colliderBbSrc = [BoundingBox.createAabb(-5, -5, 10, 10)]
        bullet.collidesWith = EntityFlags.ROLE_OBSTACLE
        bullet.hurtBy = EntityFlags.ROLE_OBSTACLE

        Script.attach(gameState, bullet, BulletScriptHandler)

        bullet.colour = 'red'
        return bullet
    }
}