import { Vector2 } from "../../game-state/Vector";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { Prefab, PrefabParameters } from "../../game-state/Prefab";
import { BoundingBox } from "../../game-state/BoundingBox";
import { Script } from "../../game-state/Script";
import { MissileBayScriptHandler } from "../scripts";

const WIDTH = 46
const HALF_W = WIDTH * 0.5
const HEIGHT = 20
const HEART_HEIGHT = 8
const DOOR_INSET_PERCENT = 0.75

interface MissileBayPrefabParameters extends PrefabParameters {
    width: number,
    height: number,
    signal: number,
    shotsPerSalvo: number,
}

export const MissileBayPrefab: Prefab<MissileBayPrefabParameters> = {
    id: "MissileBay",
    spawn(gameState, parent, parameters): Entity {
        const height = Math.max(parameters?.height || HEIGHT, HEART_HEIGHT)
        const doorHeight = Math.max(height * DOOR_INSET_PERCENT, HEART_HEIGHT)
        const totalWidth = parameters?.width || ((HALF_W + HEIGHT) * 2)
        const halfDoorW = (totalWidth * 0.5) - height

        // Bay Doors
        const bayDoors = World.spawnEntity(gameState, parent)

        bayDoors.colour = 'red'
        bayDoors.flags |= EntityFlags.ROLE_OBSTACLE
        bayDoors.collidesWith |= EntityFlags.ROLE_PLAYER_BULLET | EntityFlags.ROLE_PLAYER
        bayDoors.hurtBy |= EntityFlags.ROLE_PLAYER_BULLET
        bayDoors.flags |= EntityFlags.DESTROY_AT_0_HP
        bayDoors.hp = 30

        bayDoors.radius = halfDoorW + height

        bayDoors.flags |= EntityFlags.COLLIDER
        bayDoors.colliderBbSrc = [
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(0, -halfDoorW -height),
                Vector2.createFromCoordinates(height, -halfDoorW),
                Vector2.createFromCoordinates(0, -halfDoorW),
            ),
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(0, halfDoorW + height),
                Vector2.createFromCoordinates(height, halfDoorW),
                Vector2.createFromCoordinates(0, halfDoorW),
            ),
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(doorHeight, halfDoorW),
                Vector2.createFromCoordinates(0, halfDoorW),
                Vector2.createFromCoordinates(0, 0),
                Vector2.createFromCoordinates(doorHeight, 0),
            ),
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(doorHeight, -halfDoorW),
                Vector2.createFromCoordinates(0, -halfDoorW),
                Vector2.createFromCoordinates(0, 0),
                Vector2.createFromCoordinates(doorHeight, 0),
            ),
        ]

        // Bay heart
        const heart = Prefab.spawn(gameState, 'WeakPoint', bayDoors.id, {
            width: 0,
            height: HEART_HEIGHT,
            hp: 1,
        })
        heart.posZL = -1
        heart.flags |= EntityFlags.INVULNERABLE // Start as invulnerable (removed when doors are open)

        // Wiring
        Script.attach(gameState, bayDoors, MissileBayScriptHandler, {
            heart: heart.id,
            doorHalfW: halfDoorW,
            signal: parameters?.signal || 0,
            shotsPerSalvo: parameters?.shotsPerSalvo,
        })

        return bayDoors
    }
}
