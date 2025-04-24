import { Script } from "../../game-state/Script";
import { BoundingBox } from "../../game-state/BoundingBox";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Prefab } from "../../game-state/Prefab";
import { Vector2 } from "../../game-state/Vector";
import { JetEmitterData, MissileScriptHandler } from "../scripts";

const BODY_LENGTH = 28
const WIDTH = 12
const HALF_LEN = BODY_LENGTH * 0.5
const HALF_WIDTH = WIDTH * 0.5
const TIP_LENGTH = 8
const FR_RING_LENGTH = 4
const BK_RING_LENGTH = 6
const MAX_VELOCITY = 500
const ACCELERATION = 10000
const BREAKING = 100

export const MissilePrefab: Prefab = {
    id: "Missile",
    spawn(gameState, parent): Entity {
        const entity = World.spawnEntity(gameState, parent)

        entity.colour = 'red'
        entity.flags |= EntityFlags.ROLE_OBSTACLE
        entity.collidesWith |= EntityFlags.ROLE_PLAYER | EntityFlags.ROLE_PLAYER_BULLET
        entity.hurtBy |= EntityFlags.ROLE_PLAYER | EntityFlags.ROLE_PLAYER_BULLET
        entity.flags |= EntityFlags.DESTROY_AT_0_HP

        entity.flags |= EntityFlags.COLLIDER
        entity.colliderBbSrc = [
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(-HALF_LEN, HALF_WIDTH),
                Vector2.createFromCoordinates(-HALF_LEN + BK_RING_LENGTH, HALF_WIDTH),
                Vector2.createFromCoordinates(-HALF_LEN + BK_RING_LENGTH, -HALF_WIDTH),
                Vector2.createFromCoordinates(-HALF_LEN, -HALF_WIDTH),
            ),
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(-HALF_LEN + BK_RING_LENGTH, HALF_WIDTH),
                Vector2.createFromCoordinates(HALF_LEN - FR_RING_LENGTH, HALF_WIDTH),
                Vector2.createFromCoordinates(HALF_LEN - FR_RING_LENGTH, -HALF_WIDTH),
                Vector2.createFromCoordinates(-HALF_LEN + BK_RING_LENGTH, -HALF_WIDTH),
            ),
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(HALF_LEN - FR_RING_LENGTH, HALF_WIDTH),
                Vector2.createFromCoordinates(HALF_LEN, HALF_WIDTH),
                Vector2.createFromCoordinates(HALF_LEN + TIP_LENGTH, 0),
                Vector2.createFromCoordinates(HALF_LEN, -HALF_WIDTH),
                Vector2.createFromCoordinates(HALF_LEN - FR_RING_LENGTH, -HALF_WIDTH),
            ),
        ]

        Script.attach(gameState, entity, MissileScriptHandler, {
            maxVelM: MAX_VELOCITY,
            minVelM: MAX_VELOCITY * 0.4,
            accelM: ACCELERATION,
            decelM: BREAKING,
        })
        entity.flags |= EntityFlags.USE_INTERNAL_VELOCITY
        entity.velMI = MAX_VELOCITY * 0.5

        // Jet particles
        const jetEmitter = Prefab.spawn(gameState, 'JetEmitter', entity.id, {
            rate: 35,
            distance: 50,
        })
        jetEmitter.posXL = -HALF_LEN - 5

        return entity
    }
}
