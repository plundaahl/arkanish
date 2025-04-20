import { GameState } from "../../game-state/GameState";
import { ExtraMath } from "../../Math";
import { BoundingBox } from "../../game-state/BoundingBox";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { Prefab } from "../../game-state/Prefab";
import { Vector2 } from "../../game-state/Vector";

const CENTER = Math.PI * 0.5
const MAX_OFFSET = Math.PI * 0.4
const SIZE = 120
const SPEED = 40
const EXTRA_Y_SPEED = 100

const spawnVector: Vector2 = Vector2.createFromCoordinates(1, 1)

function spawnAtAngle(gameState: GameState, entity: Entity, center: number, offset: number, size: number, speed: number, extraYSpeed: number) {
    entity.flags |= EntityFlags.DO_NOT_CLAMP_TO_WIDTH_ON_SPAWN
    Vector2.setToCoordinates(spawnVector, -((gameState.playArea.width * 0.5) + size), 0)
    Vector2.rotateBy(spawnVector, center + offset)
    entity.posXL = Vector2.xOf(spawnVector)
    entity.posYL = -size - (gameState.playArea.width * 0.5)

    Vector2.rotateBy(spawnVector, Math.PI)
    Vector2.scaleToUnit(spawnVector)
    Vector2.scaleBy(spawnVector, speed)
    entity.posRL = Vector2.angleOf(spawnVector)
    entity.velXL = Vector2.xOf(spawnVector)
    entity.velYL = Vector2.yOf(spawnVector) + extraYSpeed
}

let lastSpawnOffset = 0

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

        const offset = ExtraMath.rollBetween(MAX_OFFSET * 0.25, MAX_OFFSET) * ExtraMath.positiveOrNegative()
        const accumulated = lastSpawnOffset + offset
        lastSpawnOffset = ExtraMath.moduloBetween(accumulated, -MAX_OFFSET, MAX_OFFSET)
        spawnAtAngle(gameState, entity, CENTER, lastSpawnOffset, SIZE, SPEED, EXTRA_Y_SPEED)

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