import { mkIntensityCalcFn } from "../util";
import { ExtraMath } from "../../Math";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Prefab, PrefabParameters } from "../../game-state/Prefab";

const VEL_MIN = 100
const VEL_MAX = 150
const ANGLE_CENTER = Math.PI * 0.5
const ANGLE_OFFSET_MAX = Math.PI * 0.08

const calculateVelocityMultiple = mkIntensityCalcFn(100, 300, 1, 1.5)

export interface MotionDriftParameters extends PrefabParameters {
    velMin: number
    velMax: number
    angleOffsetMax: number
}

export const MotionDriftPrefab: Prefab<MotionDriftParameters> = {
    id: "MotionDrift",
    spawn(gameState: GameState, parent?: number, parameters?: Partial<MotionDriftParameters> | undefined): Entity {
        const velMin = parameters?.velMin || VEL_MIN
        const velMax = parameters?.velMax || VEL_MAX
        const angleOffsetMax = parameters?.angleOffsetMax === undefined ? ANGLE_OFFSET_MAX : parameters.angleOffsetMax

        const entity = World.spawnEntity(gameState, parent)
        const velRoll = ExtraMath.rollBetween(velMin, velMax) * calculateVelocityMultiple(gameState.intensityBudget)
        const angleRoll = ExtraMath.rollBetween(-angleOffsetMax, angleOffsetMax)

        entity.flags |= EntityFlags.USE_INTERNAL_VELOCITY
        entity.velMI = velRoll
        entity.velAI = angleRoll + ANGLE_CENTER

        return entity
    }
}