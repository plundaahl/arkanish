import { GameState } from "../../../game-state/GameState";
import { BoundingBoxTypes } from "../../../game-state/BoundingBox";
import { Entity, World } from "../../../game-state/Entity";
import { Vector2 } from "../../../game-state/Vector";
import { ExtraMath } from "../../../Math";

const SIZE_MAX = 30
const SIZE_MIN = 1
const RADIUS_MAX = 150
const RADIUS_MIN = 3
const RADIUS_MULTIPLE = (RADIUS_MAX - RADIUS_MIN) / (SIZE_MAX - SIZE_MIN)
const VARIANCE_MIN = 0
const VARIANCE_MAX = 0.5
const VARIANCE_RANGE = VARIANCE_MAX - VARIANCE_MIN
const CORNERS_MIN = 5
const CORNERS_MAX = 11
const CORNERS_RANGE = CORNERS_MAX - CORNERS_MIN

export function regenerateAsteroidHitbox(gameState: GameState, entity: Entity, size: number) {
    const boundingBox = entity.colliderBbSrc[0]
    if (!boundingBox || boundingBox.type !== BoundingBoxTypes.CONVEX_POLY) {
        return
    }

    const numCorners = boundingBox.vertexes.length
    const cornerToVarianceScale = (ExtraMath.clamp(CORNERS_MIN, numCorners, CORNERS_MAX) - CORNERS_MIN) / CORNERS_RANGE
    const variance = VARIANCE_MIN + (VARIANCE_RANGE * (1 - cornerToVarianceScale))
    const radius = RADIUS_MIN + (size * RADIUS_MULTIPLE)

    for (const vertex of boundingBox.vertexes) {
        const radiusMultiple = 1 - ExtraMath.rollBetween(VARIANCE_MIN, variance)
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
