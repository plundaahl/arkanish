import { ExtraMath } from "../../../Math";
import { Entity } from "../../../game-state/Entity";
import { Vector2 } from "../../../game-state/Vector";
import { BoundingBoxTypes } from "../../../game-state/BoundingBox";

const turretVec = Vector2.createFromCoordinates(0, 0)

export function positionOnParentHitbox(turret: Entity, hitbox: Entity, sideRange: number = 1) {
    const boundingBox = hitbox.colliderBbSrc[0]
    if (boundingBox.type !== BoundingBoxTypes.CONVEX_POLY) {
        return
    }

    Vector2.setToCoordinates(turretVec, turret.posXL, turret.posYL)
    for (let i = 0; i < boundingBox.vertexes.length; i++) {
        const thisVertex = boundingBox.vertexes[i]
        const nextVertex = boundingBox.vertexes[(i + 1) % boundingBox.vertexes.length]
        const angleToThisVertex = ExtraMath.moduloBetween(Vector2.angleBetween(thisVertex, turretVec), -Math.PI, Math.PI)
        const angleToNextVertex = ExtraMath.moduloBetween(Vector2.angleBetween(turretVec, nextVertex), -Math.PI, Math.PI)

        if (angleToThisVertex <= 0 && angleToNextVertex >= 0) {
            Vector2.setToVec(turretVec, nextVertex)
            Vector2.subtract(turretVec, thisVertex)
            Vector2.scaleBy(turretVec, (Math.random() * sideRange) + ((1 - sideRange) * 0.5))
            Vector2.add(turretVec, thisVertex)

            turret.posXL = Vector2.xOf(turretVec)
            turret.posYL = Vector2.yOf(turretVec)

            Vector2.setToVec(turretVec, nextVertex)
            Vector2.subtract(turretVec, thisVertex)
            Vector2.rotateBy(turretVec, Math.PI)
            turret.posRL = Vector2.angleOf(turretVec)

            return
        }
    }
}