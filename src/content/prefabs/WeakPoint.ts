import { BoundingBox } from "../../game-state/BoundingBox";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { Prefab, PrefabParameters } from "../../game-state/Prefab";
import { Vector2 } from "../../game-state/Vector";

const DEFAULT_HALF_WIDTH = 40
const DEFAULT_HEIGHT = 8
const DEFAULT_HP = 3

interface WeakPointParameters extends PrefabParameters {
    width: number
    height: number
    hp: number
}

export const WeakPointPrefab: Prefab<WeakPointParameters> = {
    id: "WeakPoint",
    spawn(gameState, parent, parameters): Entity {
        const height = parameters?.height || DEFAULT_HEIGHT
        const halfW = parameters?.width === undefined
            ? DEFAULT_HALF_WIDTH
            : parameters.width * 0.5
        const hp = parameters?.hp || DEFAULT_HP

        const weakPoint = World.spawnEntity(gameState, parent)
        weakPoint.flags |= EntityFlags.PROPAGATE_DEATH_TO_PARENT

        weakPoint.colour = '#7E77FF'
        weakPoint.flags |= EntityFlags.ROLE_OBSTACLE
        weakPoint.collidesWith |= EntityFlags.ROLE_PLAYER | EntityFlags.ROLE_PLAYER_BULLET
        weakPoint.hurtBy |= EntityFlags.ROLE_PLAYER_BULLET
        weakPoint.flags |= EntityFlags.DESTROY_AT_0_HP
        weakPoint.hp = hp

        weakPoint.flags |= EntityFlags.COLLIDER
        weakPoint.colliderBbSrc = [
            BoundingBox.createConvexPolyBb(
                Vector2.createFromCoordinates(height, -halfW),
                Vector2.createFromCoordinates(0, -halfW),
                Vector2.createFromCoordinates(0, halfW),
                Vector2.createFromCoordinates(height, halfW),
            ),
        ]

        return weakPoint
    }
}