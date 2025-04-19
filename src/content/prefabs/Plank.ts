import { BoundingBox } from "../../game-state/BoundingBox";
import { ColliderFlags, Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Prefab } from "../../game-state/Prefab";
import { Vector2 } from "../../game-state/Vector";
import { ExtraMath } from "../../Math";

const PLANK_SECTION_SIZE = 50

export const PlankPrefab: Prefab = {
    id: "Plank",
    spawn: (gameState: GameState): Entity => {
        const center = World.spawnEntity(gameState)
        center.velY = ExtraMath.rollBetween(100, 250)
        center.velR = ExtraMath.rollBetween(0.25, 0.8) * Math.PI * ExtraMath.positiveOrNegative()
        center.posR = Math.random() * Math.PI * 2

        const numSections = Math.floor(ExtraMath.rollBetween(3, 7))
        const halfWidth = PLANK_SECTION_SIZE * numSections * 0.5

        for (let i = 0; i < numSections; i++) {
            const section = World.spawnEntity(gameState)
            section.parent = center.id
            section.posX = (PLANK_SECTION_SIZE * i) - halfWidth

            section.flags |= EntityFlags.COLLIDER
            section.collidesWith = EntityFlags.ROLE_PLAYER | EntityFlags.ROLE_PLAYER_BULLET
            section.colliderBbSrc = [BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(-25, -25),
                Vector2.createFromCoordinates(25, -25),
                Vector2.createFromCoordinates(25, 25),
                Vector2.createFromCoordinates(-25, 25),
            )]

            section.colour = 'red'
            section.flags |= EntityFlags.ROLE_OBSTACLE
            section.flags |= EntityFlags.DESTROY_AT_0_HP
            section.hurtBy |= EntityFlags.ROLE_PLAYER_BULLET
        }

        return center
    }
}