import { Vector2 } from "../../game-state/Vector";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Prefab } from "../../game-state/Prefab";
import { BoundingBox } from "../../game-state/BoundingBox";
import { Script } from "../../game-state/Script";
import { MissileBayScriptHandler } from "../scripts";

const WIDTH = 46
const HALF_W = WIDTH * 0.5
const HEIGHT = 20
const DOOR_HEIGHT = 15
const DOOR_OFFSET = 0
const HEART_HEIGHT = 8

export const MissileBayPrefab: Prefab = {
    id: "MissileBay",
    spawn(gameState: GameState): Entity {
        // Bay Doors
        const bayDoors = World.spawnEntity(gameState)
        
        bayDoors.colour = 'red'
        bayDoors.flags |= EntityFlags.ROLE_OBSTACLE
        bayDoors.collidesWith |= EntityFlags.ROLE_PLAYER_BULLET | EntityFlags.ROLE_PLAYER
        bayDoors.hurtBy |= EntityFlags.ROLE_PLAYER_BULLET
        bayDoors.flags |= EntityFlags.DESTROY_AT_0_HP
        bayDoors.hp = 30

        bayDoors.flags |= EntityFlags.COLLIDER
        bayDoors.colliderBbSrc = [
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(0, -HALF_W -HEIGHT),
                Vector2.createFromCoordinates(HEIGHT, -HALF_W),
                Vector2.createFromCoordinates(0, -HALF_W),
            ),
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(0, HALF_W + HEIGHT),
                Vector2.createFromCoordinates(HEIGHT, HALF_W),
                Vector2.createFromCoordinates(0, HALF_W),
            ),
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(DOOR_OFFSET + DOOR_HEIGHT, HALF_W),
                Vector2.createFromCoordinates(DOOR_OFFSET, HALF_W),
                Vector2.createFromCoordinates(DOOR_OFFSET, 0),
                Vector2.createFromCoordinates(DOOR_OFFSET + DOOR_HEIGHT, 0),
            ),
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(DOOR_OFFSET + DOOR_HEIGHT, -HALF_W),
                Vector2.createFromCoordinates(DOOR_OFFSET, -HALF_W),
                Vector2.createFromCoordinates(DOOR_OFFSET, 0),
                Vector2.createFromCoordinates(DOOR_OFFSET + DOOR_HEIGHT, 0),
            ),
        ]

        // Bay heart
        const heart = World.spawnEntity(gameState)
        heart.parent = bayDoors.id
        heart.posZL = -1
        heart.flags |= EntityFlags.PROPAGATE_DEATH_TO_PARENT

        heart.colour = '#7E77FF'
        heart.flags |= EntityFlags.ROLE_OBSTACLE
        heart.collidesWith |= EntityFlags.ROLE_PLAYER | EntityFlags.ROLE_PLAYER_BULLET
        heart.hurtBy |= EntityFlags.ROLE_PLAYER_BULLET
        heart.flags |= EntityFlags.INVULNERABLE // Start as invulnerable (removed when doors are open)
        heart.flags |= EntityFlags.DESTROY_AT_0_HP
        heart.hp = 3

        heart.flags |= EntityFlags.COLLIDER
        heart.colliderBbSrc = [
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(HEART_HEIGHT, 0),
                Vector2.createFromCoordinates(DOOR_OFFSET, 0),
                Vector2.createFromCoordinates(DOOR_OFFSET, 0),
                Vector2.createFromCoordinates(HEART_HEIGHT, 0),
            ),
        ]
        
        // Wiring
        Script.attach(gameState, bayDoors, MissileBayScriptHandler, {
            heart: heart.id,
        })

        return bayDoors
    }
}
