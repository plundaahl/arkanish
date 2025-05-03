import { randomizeSpin } from "../scripts/behaviours/randomizeSpin";
import { ExtraMath } from "../../Math";
import { Entity, EntityFlags } from "../../game-state/Entity";
import { Prefab, PrefabParameters } from "../../game-state/Prefab";
import { regenerateAsteroidHitbox } from "../scripts/behaviours/regenerateAsteroidHitbox";
import { AsteroidHitboxParameters } from "./AsteroidHitBox";
import { Vector2 } from "../../game-state/Vector";
import { BoundingBoxTypes } from "../../game-state/BoundingBox";
import { MotionDriftParameters } from "./MotionDrift";
import { Script } from "../../game-state/Script";
import { AsteroidBaseScriptHandler } from "../scripts";
import { positionOnParentHitbox } from "../scripts/behaviours/positionOnParentHitbox";

const SIZE_MIN = 15
const SIZE_MAX = 35
const SCORE_MIN = 10
const SCORE_MAX = 60
const SCORE_RANGE = (SCORE_MAX - SCORE_MIN) / (SIZE_MAX - SIZE_MIN)
const VEL_MIN = 100
const VEL_MAX = 200
const HP_MIN = 5
const HP_MAX = 10
const SIZE_TO_HP = (HP_MAX - HP_MIN) / (SIZE_MAX - SIZE_MIN)
const TURRETS_MIN = 1
const TURRETS_MAX = 4
const SIZE_TO_TURRETS = (TURRETS_MAX - TURRETS_MIN) / (SIZE_MAX - SIZE_MIN)

export interface AsteroidTurretBaseParameters extends PrefabParameters {
    minSize: number,
    maxSize: number,
}

const turretVec = Vector2.createFromCoordinates(0, 0)

export const AsteroidTurretBasePrefab: Prefab<AsteroidTurretBaseParameters> = {
    id: 'AsteroidTurretBase',
    spawn(gameState, parent, parameters): Entity {
        const minSize = Math.max(parameters?.minSize || SIZE_MIN, SIZE_MIN)
        const maxSize = Math.max(Math.min(parameters?.maxSize || SIZE_MAX, SIZE_MAX), minSize)
        const sizeRoll = Math.round(ExtraMath.rollBetween(minSize, maxSize))

        const position = Prefab.spawn(gameState, 'MotionDrift', parent, {
            velMin: VEL_MIN,
            velMax: VEL_MAX,
        } as MotionDriftParameters)
        Script.attach(gameState, position, AsteroidBaseScriptHandler)

        const hitboxParams: AsteroidHitboxParameters = {
            minCorners: 4,
            maxCorners: 7,
        }
        const hitbox = Prefab.spawn(gameState, 'AsteroidHitbox', position.id, hitboxParams)
        hitbox.hp = HP_MIN + ((sizeRoll - SIZE_MIN) * SIZE_TO_HP)
        hitbox.scoreValue = Math.round((sizeRoll * SCORE_RANGE) + SCORE_MIN)
        hitbox.flags |= EntityFlags.PROPAGATE_DEATH_TO_PARENT
        hitbox.flags |= EntityFlags.DESTROY_AT_0_HP
        hitbox.hurtBy |= EntityFlags.ROLE_PLAYER_BULLET
        hitbox.scoreValue = 80

        regenerateAsteroidHitbox(gameState, hitbox, sizeRoll)
        randomizeSpin(hitbox, 2)

        const numTurrets = TURRETS_MIN + ((sizeRoll - SIZE_MIN) * SIZE_TO_TURRETS)
        const boundingBox = hitbox.colliderBbSrc[0]
        if (boundingBox?.type !== BoundingBoxTypes.CONVEX_POLY) {
            console.warn(`AsteroidHitbox bounding box is not a convex poly.`)
        } else {
            for (let i = 0; i < numTurrets; i++) {                
                const turret = Prefab.spawn(gameState, 'Turret', hitbox.id)
                turret.collidesWith |= EntityFlags.ROLE_PLAYER_BULLET | EntityFlags.ROLE_PLAYER
                turret.hurtBy |= EntityFlags.ROLE_PLAYER_BULLET
                turret.flags |= EntityFlags.DESTROY_AT_0_HP
                turret.hp = 2
                turret.scoreValue = 15
                
                Vector2.setToAngleAndMag(turretVec, Math.random() * ExtraMath.FULL_CIRCLE, 1)
                turret.posXL = Vector2.xOf(turretVec)
                turret.posYL = Vector2.yOf(turretVec)

                positionOnParentHitbox(turret, hitbox)
            }
        }

        return position
    },
}
