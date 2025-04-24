import { BoundingBox } from "../../game-state/BoundingBox";
import { EntityFlags, World } from "../../game-state/Entity";
import { Prefab } from "../../game-state/Prefab";
import { Vector2 } from "../../game-state/Vector";

const SPEED = 40

export const GunshipPrefab: Prefab = {
    id: 'Gunship',
    spawn(gameState, parent) {
        const entity = World.spawnEntity(gameState, parent)

        entity.flags |= EntityFlags.ROLE_OBSTACLE | EntityFlags.DESTROY_AT_0_HP
        entity.collidesWith |= EntityFlags.ROLE_PLAYER_BULLET | EntityFlags.ROLE_PLAYER
        entity.hurtBy |= EntityFlags.ROLE_PLAYER_BULLET
        entity.hp = 10
        entity.scoreValue = 100

        entity.colour = 'red'

        entity.defaultSpawner = 'SpawnPosAngledAbove'
        entity.radius = 120

        entity.flags |= EntityFlags.USE_INTERNAL_VELOCITY
        entity.velMI = SPEED

        entity.flags |= EntityFlags.COLLIDER
        entity.colliderBbSrc = [
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(120, 15),
                Vector2.createFromCoordinates(0, 50),
                Vector2.createFromCoordinates(-80, 50),
                Vector2.createFromCoordinates(-120, 20),
                Vector2.createFromCoordinates(-120, -20),
                Vector2.createFromCoordinates(-80, -50),
                Vector2.createFromCoordinates(0, -50),
                Vector2.createFromCoordinates(120, -15),
            )
        ]

        const turret1 = Prefab.spawn(gameState, 'Turret', entity.id)
        const turret2 = Prefab.spawn(gameState, 'Turret', entity.id)
        const turret3 = Prefab.spawn(gameState, 'Turret', entity.id)

        turret1.posXL = 40
        turret2.posXL = -20
        turret3.posXL = -80

        return entity
    },
}