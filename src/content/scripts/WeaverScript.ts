import { ExtraMath } from "../../Math"
import { ScriptHandler } from "../../game-state/Script"
import { Prefab } from "../../game-state/Prefab"
import { Vector2 } from "../../game-state/Vector"
import { mkIntensityCalcFn } from "../util"

const SHOT_SPEED = 400
const MUZZLE_LENGTH = 40

const calculateMsPerShot = mkIntensityCalcFn(100, 300, 1300, 800)

interface WeaverScriptData {
    travelDir: number
    maxVeer: number
    accelR: number
    maxVelR: number
    dir: number
    particleTime: number
    shotTime: number
}

const shotDirVec: Vector2 = Vector2.createFromCoordinates(1, 0)

export const WeaverScriptHandler: ScriptHandler<'Weaver', WeaverScriptData> = {
    type: 'Weaver',
    script: {
        type: 'Weaver',
        onInit(_, entity) {
            const data = entity.scriptData as WeaverScriptData
            data.travelDir = entity.posRL
            entity.posRL += data.dir * data.maxVeer
        },
        onUpdate(gameState, entity) {
            const data = entity.scriptData as WeaverScriptData

            const minAngle = -data.maxVeer
            const maxAngle = data.maxVeer
            const curAngle = ExtraMath.moduloBetween(entity.posRL - data.travelDir, -Math.PI, Math.PI)

            if (curAngle < minAngle) {
                data.dir = 1
            } else if (curAngle > maxAngle) {
                data.dir = -1
            }

            entity.velRL = ExtraMath.clamp(-data.maxVelR, entity.velRL + (data.accelR * data.dir), data.maxVelR)

            if (data.shotTime < gameState.gameTime && entity.posYG > gameState.playArea.top) {
                data.shotTime = gameState.gameTime + calculateMsPerShot(gameState.intensityBudget)
                const bullet = Prefab.spawn(gameState, 'EnemyBullet')
                Vector2.setToAngleAndMag(shotDirVec, entity.posRL, SHOT_SPEED)
                bullet.velXL = Vector2.xOf(shotDirVec)
                bullet.velYL = Vector2.yOf(shotDirVec)
                Vector2.scaleToUnit(shotDirVec)
                Vector2.scaleBy(shotDirVec, MUZZLE_LENGTH)
                bullet.posXL = entity.posXG + Vector2.xOf(shotDirVec)
                bullet.posYL = entity.posYG + Vector2.yOf(shotDirVec)
            }
        },
    },
    nullData: {
        travelDir: 0,
        maxVeer: Math.PI * 0.4,
        accelR: Math.PI * 0.4,
        maxVelR: Math.PI * 1,
        dir: 1,
        particleTime: 0,
        shotTime: 0,
    },
    serializeData: function (data: WeaverScriptData): Object {
        throw new Error("Function not implemented.")
    },
    deserializeData: function (input: unknown): WeaverScriptData | undefined {
        throw new Error("Function not implemented.")
    }
}
