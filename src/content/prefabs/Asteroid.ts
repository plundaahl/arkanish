import { BoundingBox } from "../../game-state/BoundingBox";
import { ColliderFlags, Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Prefab } from "../../game-state/Prefab";

export const AsteroidPrefab: Prefab = {
    id: "Asteroid",
    spawn: (gameState: GameState): Entity => {
        const entity = World.spawnEntity(gameState)

        const maxSize = gameState.playArea.width * 0.45
        const minSize = gameState.playArea.width * 0.1
        const size = Math.ceil((Math.random() * (maxSize - minSize)) + minSize)
        const halfSize = size * 0.5

        const maxVel = gameState.playArea.height * 0.7
        const minVel = gameState.playArea.height * 0.3
        const vel = Math.ceil(Math.random() * (maxVel - minVel)) + minVel

        entity.posY = -size
        entity.velY = vel

        entity.flags |= EntityFlags.COLLIDER
        entity.colliderBbSrc = [BoundingBox.createAabb(-halfSize, -halfSize, size, size)]
        entity.colliderBbTransform = [BoundingBox.clone(entity.colliderBbSrc[0])]
        entity.colliderGroup = ColliderFlags.ENEMY
        entity.collidesWith = ColliderFlags.PLAYER | ColliderFlags.PLAYER_BULLET

        entity.colour = 'red'
        entity.flags |= EntityFlags.KILLS_PLAYER_BULLETS
        entity.flags |= EntityFlags.HURTS_PLAYER
        entity.flags |= EntityFlags.HURT_BY_PLAYER_BULLETS

        return entity
    }
}