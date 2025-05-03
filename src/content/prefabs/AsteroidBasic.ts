import { ExtraMath } from "../../Math";
import { Entity, EntityFlags } from "../../game-state/Entity";
import { Prefab, PrefabParameters } from "../../game-state/Prefab";
import { Script } from "../../game-state/Script";
import { AsteroidBasicScriptHandler } from "../scripts";
import { regenerateAsteroidHitbox } from "../scripts/behaviours/regenerateAsteroidHitbox";

const SIZE_MIN = 1
const SIZE_MAX = 7
const SCORE_MIN = 10
const SCORE_MAX = 60
const SCORE_RANGE = (SCORE_MAX - SCORE_MIN) / (SIZE_MAX - SIZE_MIN)

export interface AsteroidBasicParameters extends PrefabParameters {
    minSize: number,
    maxSize: number,
}

export const AsteroidBasicPrefab: Prefab<AsteroidBasicParameters> = {
    id: 'AsteroidBasic',
    spawn(gameState, parent, parameters): Entity {
        const minSize = Math.max(parameters?.minSize || SIZE_MIN, SIZE_MIN)
        const maxSize = Math.max(Math.min(parameters?.maxSize || SIZE_MAX, SIZE_MAX), minSize)
        const sizeRoll = Math.round(ExtraMath.rollBetween(minSize, maxSize))

        const position = Prefab.spawn(gameState, 'MotionDrift', parent)
        const hitbox = Prefab.spawn(gameState, 'AsteroidHitbox', position.id)     

        hitbox.hp = sizeRoll
        hitbox.scoreValue = Math.round((sizeRoll * SCORE_RANGE) + SCORE_MIN)
        hitbox.flags |= EntityFlags.PROPAGATE_DEATH_TO_PARENT
        hitbox.flags |= EntityFlags.DESTROY_AT_0_HP
        hitbox.hurtBy |= EntityFlags.ROLE_PLAYER_BULLET

        regenerateAsteroidHitbox(gameState, hitbox, sizeRoll)
        Script.attach(gameState, hitbox, AsteroidBasicScriptHandler)

        return position
    },
}