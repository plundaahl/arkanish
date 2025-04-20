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

        entity.posYL = -size
        entity.velYL = vel

        entity.flags |= EntityFlags.COLLIDER
        entity.colliderBbSrc = [BoundingBox.createAabb(-halfSize, -halfSize, size, size)]
        entity.collidesWith = EntityFlags.ROLE_PLAYER | EntityFlags.ROLE_PLAYER_BULLET

        entity.colour = 'red'
        entity.flags |= EntityFlags.ROLE_OBSTACLE
        entity.flags |= EntityFlags.DESTROY_AT_0_HP
        entity.hurtBy |= EntityFlags.ROLE_PLAYER_BULLET

        entity.scoreValue = 10

        return entity
    }
}