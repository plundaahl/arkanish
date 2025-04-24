import { ExtraMath } from "../../Math";
import { BoundingBox } from "../../game-state/BoundingBox";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { Prefab } from "../../game-state/Prefab";
import { Vector2 } from "../../game-state/Vector";

const CENTER_W = 60
const CENTER_L = 80
const SIDE_HEART_L = 26
const EXTRUSION_H = 15
const NOSE_EXT_H = 10
const NOSE_W = 40
const NOSE_L = 80
const NOSE_INSET = 10
const NOSE_INSET_W = NOSE_W + ((CENTER_W - NOSE_W) * (NOSE_INSET / NOSE_L))
const ENGINE_L = 10
const ENGINE_W = 46
const ENGINE_TAPER = 8
const JET_STREAM_OFFSET = 3
const TURRET_POS = CENTER_L * -0.6
const MAX_ROTATION_SPEED = Math.PI * 0.02

export const MissileFrigatePrefab: Prefab = {
    id: "MissileFrigate",
    spawn(gameState, parent): Entity {
        // Frigate Body
        const body = World.spawnEntity(gameState, parent)

        body.colour = 'red'
        body.flags |= EntityFlags.ROLE_OBSTACLE
        body.collidesWith |= EntityFlags.ROLE_PICKUP | EntityFlags.ROLE_PLAYER_BULLET
        body.hurtBy |= EntityFlags.ROLE_PLAYER_BULLET
        body.flags |= EntityFlags.DESTROY_AT_0_HP
        body.hp = 40

        body.defaultSpawner = 'SpawnPosAngledAbove'
        body.radius = NOSE_L

        body.flags |= EntityFlags.USE_INTERNAL_VELOCITY
        body.velMI = 50
        body.velRL = MAX_ROTATION_SPEED * ExtraMath.positiveOrNegative()

        body.flags |= EntityFlags.COLLIDER
        body.colliderBbSrc = [
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(0, CENTER_W * 0.5),
                Vector2.createFromCoordinates(-CENTER_L, CENTER_W * 0.5),
                Vector2.createFromCoordinates(-CENTER_L, CENTER_W * -0.5),
                Vector2.createFromCoordinates(0, CENTER_W * -0.5),
            ),
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(-SIDE_HEART_L, CENTER_W * 0.5),
                Vector2.createFromCoordinates(-SIDE_HEART_L - EXTRUSION_H, (CENTER_W * 0.5) + EXTRUSION_H),
                Vector2.createFromCoordinates(-CENTER_L + EXTRUSION_H, (CENTER_W * 0.5) + EXTRUSION_H),
                Vector2.createFromCoordinates(-CENTER_L, CENTER_W * 0.5),
            ),
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(-SIDE_HEART_L, CENTER_W * -0.5),
                Vector2.createFromCoordinates(-SIDE_HEART_L - EXTRUSION_H, (CENTER_W * -0.5) - EXTRUSION_H),
                Vector2.createFromCoordinates(-CENTER_L + EXTRUSION_H, (CENTER_W * -0.5) - EXTRUSION_H),
                Vector2.createFromCoordinates(-CENTER_L, CENTER_W * -0.5),
            ),
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(0, CENTER_W * -0.5),
                Vector2.createFromCoordinates(NOSE_EXT_H, (CENTER_W * -0.5) - NOSE_EXT_H),
                Vector2.createFromCoordinates(NOSE_L, NOSE_W * -0.5),
            ),
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(0, CENTER_W * 0.5),
                Vector2.createFromCoordinates(NOSE_EXT_H, (CENTER_W * 0.5) + NOSE_EXT_H),
                Vector2.createFromCoordinates(NOSE_L, NOSE_W * 0.5),
            ),
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(-CENTER_L, ENGINE_W * 0.5),
                Vector2.createFromCoordinates(-CENTER_L - ENGINE_L, (ENGINE_W * 0.5) - ENGINE_TAPER),
                Vector2.createFromCoordinates(-CENTER_L - ENGINE_L, (ENGINE_W * -0.5) + ENGINE_TAPER),
                Vector2.createFromCoordinates(-CENTER_L, ENGINE_W * -0.5),
            ),
        ]

        // Nose
        const nose = World.spawnEntity(gameState, body.id)
        nose.posZL = -1

        nose.colour = '#440000'
        nose.flags |= EntityFlags.COLLIDER
        nose.colliderBbSrc = [
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(0, CENTER_W * -0.5),
                Vector2.createFromCoordinates(NOSE_L - NOSE_INSET, NOSE_INSET_W * -0.5),
                Vector2.createFromCoordinates(NOSE_L - NOSE_INSET, NOSE_INSET_W * 0.5),
                Vector2.createFromCoordinates(0, CENTER_W * 0.5),
            ),
        ]

        // Missile Bay
        const missileBay = Prefab.spawn(gameState, 'MissileBay', body.id, {
            width: 60,
            height: 12,
            shotsPerSalvo: 3,
        })
        missileBay.posZL = 2
        missileBay.flags |= EntityFlags.PROPAGATE_DEATH_TO_PARENT

        // Weak Points
        const weakPointL = Prefab.spawn(gameState, 'WeakPoint', body.id, {
            width: SIDE_HEART_L - 4,
            height: CENTER_W,
            hp: 3,
        })
        weakPointL.posRL = Math.PI * 0.5
        weakPointL.posXL = SIDE_HEART_L * -0.5
        weakPointL.posYL = CENTER_W * -0.5

        // Turret
        const turret = Prefab.spawn(gameState, 'Turret', body.id)
        turret.posXL = TURRET_POS

        // Jet Emitter
        const jetOffset = ((ENGINE_W * -0.5) + ENGINE_TAPER) * 0.5
        const jetParameters = {
            distance: 15,
            rate: 5,
            lifetime: 500,
        }

        const jetEmitterL = Prefab.spawn(gameState, 'JetEmitter', body.id, jetParameters)
        jetEmitterL.posXL = -CENTER_L - ENGINE_L - JET_STREAM_OFFSET
        jetEmitterL.posYL = jetOffset

        const jetEmitterR = Prefab.spawn(gameState, 'JetEmitter', body.id, jetParameters)
        jetEmitterR.posXL = -CENTER_L - ENGINE_L - JET_STREAM_OFFSET
        jetEmitterR.posYL = -jetOffset

        const jetEmitterC = Prefab.spawn(gameState, 'JetEmitter', body.id, jetParameters)
        jetEmitterC.posXL = -CENTER_L - ENGINE_L - JET_STREAM_OFFSET

        return body
    }
}