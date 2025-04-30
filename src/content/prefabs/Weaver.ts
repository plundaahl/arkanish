import { Vector2 } from "../../game-state/Vector";
import { BoundingBox } from "../../game-state/BoundingBox";
import { EntityFlags, World } from "../../game-state/Entity";
import { Prefab } from "../../game-state/Prefab";
import { Script } from "../../game-state/Script";
import { JetEmitterData, WeaverScriptHandler } from "../scripts";
import { ExtraMath } from "../../Math";
import { INTENSITIES } from "./intensities";

const MIN_SPEED_MULTIPLE = 0.4
const MAX_SPEED_MULTIPLE = 0.9

const MIN_VEER = Math.PI * 0.2
const MAX_VEER = Math.PI * 0.5

const TRANSLATE_SPEED = 300
const ACCEL_R = Math.PI * 0.4
const MAX_VEL_R = Math.PI * 1

export const WeaverPrefab: Prefab = {
    id: 'Weaver',
    intensity: INTENSITIES.Weaver,
    spawn(gameState, parent) {
        const entity = World.spawnEntity(gameState, parent)

        entity.flags |= EntityFlags.ROLE_OBSTACLE
        entity.collidesWith |= EntityFlags.ROLE_PLAYER | EntityFlags.ROLE_PLAYER_BULLET
        entity.hurtBy |= EntityFlags.ROLE_PLAYER_BULLET
        entity.flags |= EntityFlags.DESTROY_AT_0_HP

        entity.colour = 'red'
        entity.scoreValue = 15

        entity.flags |= EntityFlags.COLLIDER
        entity.colliderBbSrc = [
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(35, -5),
                Vector2.createFromCoordinates(35, 5),
                Vector2.createFromCoordinates(10, 15),
                Vector2.createFromCoordinates(-10, 15),
                Vector2.createFromCoordinates(-10, -15),
                Vector2.createFromCoordinates(10, -15),
            )
        ]

        const speedMultiple = ExtraMath.rollBetween(MIN_SPEED_MULTIPLE, MAX_SPEED_MULTIPLE)

        entity.posRL = Math.PI * 0.5
        entity.posYL = -450
        entity.velMI = TRANSLATE_SPEED * speedMultiple
        entity.flags |= EntityFlags.USE_INTERNAL_VELOCITY

        Script.attach(gameState, entity, WeaverScriptHandler, {
            travelDir: 0,
            maxVeer: ExtraMath.rollBetween(MIN_VEER, MAX_VEER),
            accelR: ACCEL_R * speedMultiple,
            maxVelR: MAX_VEL_R * speedMultiple,
            dir: 1,
            particleTime: 0,
            shotTime: 0,
        })

        const jetEmitter = Prefab.spawn(gameState, 'JetEmitter', entity.id)
        jetEmitter.posRL = Math.PI * 0.5
        jetEmitter.posXL = -15
        const jetData = (jetEmitter.scriptData as JetEmitterData)
        jetData.distance = 50
        jetData.lifetime = 1000

        return entity
    },
}
