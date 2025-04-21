import { Vector2 } from "../../game-state/Vector";
import { EntityFlags, World } from "../../game-state/Entity";
import { ScriptHandler } from "../../game-state/Script";
import { DEFAULT_STEERING_DATA as DEFAULT_STEERING_DATA, SteeringData, steerTowardsEntity } from "./behaviours/steerTowardsEntity";
import { ExtraMath } from "../../Math";
import { LaunchParticle } from "../particles";

const DISABLE_RANGE = 250
const LOCKING_ANGLE = Math.PI * 0.5
const EVASION_ANGLE = Math.PI * 0.8
const DEFAULT_SEEK_DELAY = 500

const STATE_LAUNCHING = 0
const STATE_SEEKING = 1
const STATE_LOCKED = 2
const STATE_EVASION_RANGE = 3

export interface MissileScriptData extends SteeringData {
    targetId: number
    state: number
    launchTime: number
    seekDelay: number
}

const missileVector = Vector2.createFromCoordinates(0, 1)
const vecToTarget = Vector2.createFromCoordinates(0, 1)

export const MissileScriptHandler: ScriptHandler<'Missile', MissileScriptData> = {
    type: "Missile",
    script: {
        type: "Missile",
        onInit(gameState, entity) {
            const data = (entity.scriptData as MissileScriptData)
            data.targetId = gameState.playerId
            data.launchTime = gameState.time
        },
        onUpdate(gameState, entity) {
            const data = (entity.scriptData as MissileScriptData)
            const target = World.getEntity(gameState, data.targetId)

            if (data.state === STATE_LAUNCHING) {
                data.state = STATE_SEEKING
                for (let i = 0; i < 30; i++) {
                    LaunchParticle.spawn(
                        gameState,
                        entity.posXG,
                        entity.posYG,
                        entity.posZG - 1,
                        entity.posRG,
                        150,
                        1200,
                    )
                }
            }

            if (data.launchTime + DEFAULT_SEEK_DELAY > gameState.time) {
                return
            }

            // If the missile gets within a certain range and passes the target (i.e., it starts moving away),
            // disable homing so that it doesn't loop forever.
            if (target) {
                Vector2.setToCoordinates(vecToTarget, target.posXG, target.posYG)
                Vector2.setToCoordinates(missileVector, entity.posXG, entity.posYG)
                Vector2.subtract(vecToTarget, missileVector)

                const distanceToTarget = Vector2.magnitudeOf(vecToTarget)
                const absAngleToTarget = Math.abs(ExtraMath.moduloBetween(Vector2.angleOf(vecToTarget), -Math.PI, Math.PI))

                if (data.state === STATE_SEEKING) {
                    if (absAngleToTarget <= LOCKING_ANGLE) {
                        data.state = STATE_LOCKED
                    }
                } else if (data.state === STATE_LOCKED) {
                    if (distanceToTarget <= DISABLE_RANGE) {
                        data.state = STATE_EVASION_RANGE
                    }
                } else if (data.state === STATE_EVASION_RANGE) {
                    if (absAngleToTarget > EVASION_ANGLE) {
                        data.targetId = 0
                    }
                }

                // Lose target lock if off-screen
                if (data.state !== STATE_SEEKING && !(entity.flags & EntityFlags.IN_PLAY_AREA)) {
                    data.targetId = 0
                }
            }

            steerTowardsEntity(gameState, entity, target, data)
        },
    },
    nullData: {
        ...DEFAULT_STEERING_DATA,
        targetId: 0,
        state: STATE_LAUNCHING,
        launchTime: 0,
        seekDelay: DEFAULT_SEEK_DELAY,
    },
    serializeData(data: MissileScriptData): Object {
        return {}
    },
    deserializeData(input: unknown): MissileScriptData | undefined {
        return typeof input === 'object'
            ? Object.assign({}, MissileScriptHandler.nullData)
            : undefined
    }
}
