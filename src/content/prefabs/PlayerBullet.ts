import { ColliderFlags, Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Prefab } from "../../game-state/Prefab";
import { BoundingBox } from "../../game-state/BoundingBox";
import { BulletScriptHandler } from "../scripts";
import { Script } from "../../game-state/Script";

const PLAYER_BULLET_SPEED = -500

export const PlayerBulletPrefab: Prefab = {
    id: "PlayerBullet",
        spawn: function (gameState: GameState): Entity {
        const bullet = World.spawnEntity(gameState)
        bullet.flags |= EntityFlags.ROLE_PLAYER_BULLET

        bullet.velY = PLAYER_BULLET_SPEED

        bullet.flags |= EntityFlags.COLLIDER
        bullet.colliderBbSrc = [BoundingBox.createAabb(-5, -5, 10, 10)]
        bullet.colliderBbTransform = [BoundingBox.createAabb(-5, -5, 10, 10)]
        bullet.colliderGroup = ColliderFlags.PLAYER_BULLET
        bullet.collidesWith = ColliderFlags.ENEMY

        Script.attach(bullet, BulletScriptHandler)

        bullet.colour = 'red'
        return bullet
    }
}