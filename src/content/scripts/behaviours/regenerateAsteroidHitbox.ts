import { GameState } from "../../../game-state/GameState";
import { BoundingBoxTypes } from "../../../game-state/BoundingBox";
import { Entity, World } from "../../../game-state/Entity";
import { Vector2 } from "../../../game-state/Vector";
import { ExtraMath } from "../../../Math";

const SIZE_MAX = 10
const SIZE_MIN = 1
const RADIUS_MAX = 150
const RADIUS_MIN = 10
const RADIUS_MULTIPLE = (RADIUS_MAX - RADIUS_MIN) / (SIZE_MAX - SIZE_MIN)

export function regenerateAsteroidHitbox(gameState: GameState, entity: Entity, size: number) {
    const boundingBox = entity.colliderBbSrc[0]
    if (!boundingBox || boundingBox.type !== BoundingBoxTypes.CONVEX_POLY) {
        return
    }

    const numCorners = boundingBox.vertexes.length
    const radiusVarianceMultiple = 0.5 - (0.2 * Math.round((numCorners - 5)))
    const radius = RADIUS_MIN + (size * RADIUS_MULTIPLE)

    for (const vertex of boundingBox.vertexes) {
        const radiusMultiple = 1 - ExtraMath.rollBetween(0, radiusVarianceMultiple)
        Vector2.scaleToUnit(vertex)
        Vector2.scaleBy(vertex, radius * radiusMultiple)
    }

    entity.radius = radius
    if (entity.parent) {
        const parent = World.getEntity(gameState, entity.parent)
        if (parent) {
            parent.radius = radius
        }
    }
}
