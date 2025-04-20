import { ExtraMath } from "../../Math";
import { BoundingBox } from "../../game-state/BoundingBox";
import { EntityFlags, World } from "../../game-state/Entity";
import { Prefab } from "../../game-state/Prefab";
import { Vector2 } from "../../game-state/Vector";

const MIN_SPAWN_VECTOR = Math.PI * 0.1
const MAX_SPAWN_VECTOR = Math.PI * 0.9
const SIZE = 120
const SPEED = 40
const EXTRA_Y_SPEED = 100

const spawnVector: Vector2 = Vector2.createFromCoordinates(1, 1)

export const GunshipPrefab: Prefab = {
    id: 'Gunship',
    spawn(gameState) {
        const entity = World.spawnEntity(gameState)

        entity.flags |= EntityFlags.ROLE_OBSTACLE | EntityFlags.DESTROY_AT_0_HP
        entity.collidesWith |= EntityFlags.ROLE_PLAYER_BULLET | EntityFlags.ROLE_PLAYER
        entity.hurtBy |= EntityFlags.ROLE_PLAYER_BULLET
        entity.hp = 10
        entity.scoreValue = 100

        entity.colour = 'red'

        entity.flags |= EntityFlags.DO_NOT_CLAMP_TO_WIDTH_ON_SPAWN
        Vector2.setToCoordinates(spawnVector, -((gameState.playArea.width * 0.5) + SIZE), 0)
        Vector2.rotateBy(spawnVector, ExtraMath.rollBetween(MIN_SPAWN_VECTOR, MAX_SPAWN_VECTOR))
        entity.posXL = Vector2.xOf(spawnVector)
        entity.posYL = Vector2.yOf(spawnVector) + (gameState.playArea.width * 0.25)

        Vector2.rotateBy(spawnVector, Math.PI)
        Vector2.scaleToUnit(spawnVector)
        Vector2.scaleBy(spawnVector, SPEED)
        entity.posRL = Vector2.angleOf(spawnVector)
        entity.velXL = Vector2.xOf(spawnVector)
        entity.velYL = Vector2.yOf(spawnVector) + EXTRA_Y_SPEED

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

        const turret1 = Prefab.spawn(gameState, 'Turret')
        const turret2 = Prefab.spawn(gameState, 'Turret')
        const turret3 = Prefab.spawn(gameState, 'Turret')

        turret1.parent = entity.id
        turret2.parent = entity.id
        turret3.parent = entity.id

        turret1.posXL = 40
        turret2.posXL = -20
        turret3.posXL = -80

        return entity
    },
}