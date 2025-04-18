import { ColliderFlags, Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Prefab } from "../../game-state/Prefab";
import { Vector2 } from "../../game-state/Vector";
import { BoundingBox } from "../../game-state/BoundingBox";
import { BouncyBallScriptHandler } from "../scripts";
import { Script } from "../../game-state/Script";

export const BouncyBallPrefab: Prefab = {
    id: "BouncyBall",
    spawn: (gameState: GameState): Entity => {
        const entity = World.spawnEntity(gameState)

        const halfSize = 20

        const minMag = gameState.playArea.height * 0.5
        const maxMag = gameState.playArea.height * 0.8
        const minAngle = Math.PI * 1.25
        const maxAngle = Math.PI * 1.45 
        const angle = (Math.random() * (maxAngle - minAngle)) + minAngle
        const mag = (Math.random() * (maxMag - minMag)) + minMag
        const vec = Vector2.createFromAngle(angle, mag)

        entity.posY = -halfSize
        entity.velY = Vector2.yOf(vec)
        entity.velX = Vector2.xOf(vec) * (Math.random() < 0.5 ? 1 : -1)

        entity.flags |= EntityFlags.COLLIDER
        entity.colliderBbSrc = [BoundingBox.createCircleBb(0, 0, halfSize)]
        entity.colliderBbTransform = [BoundingBox.clone(entity.colliderBbSrc[0])]
        entity.colliderGroup = ColliderFlags.ENEMY
        entity.collidesWith = ColliderFlags.PLAYER | ColliderFlags.PLAYER_BULLET

        Script.attach(entity, BouncyBallScriptHandler)
        entity.flags |= EntityFlags.BOUNCE_IN_PLAY_SPACE
        entity.hp = Math.ceil(Math.random() * 3) + 1

        entity.colour = 'red'
        entity.flags |= EntityFlags.KILLS_PLAYER_BULLETS
        entity.flags |= EntityFlags.HURTS_PLAYER
        entity.flags |= EntityFlags.HURT_BY_PLAYER_BULLETS

        return entity
    }
}