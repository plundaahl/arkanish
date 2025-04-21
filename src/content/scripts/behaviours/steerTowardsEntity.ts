import { ExtraMath } from "../../../Math"
import { Vector2 } from "../../../game-state/Vector"
import { Entity } from "../../../game-state/Entity"
import { GameState } from "../../../game-state/GameState"

const DEFAULT_MAX_VEL_R = Math.PI * 0.5
const DEFAULT_TURN_SOFTENING = Math.PI * 0.1
const DEFAULT_DEAD_ZONE = Math.PI * 0.01
const DEFAULT_MIN_VEL_SCALE = 0.2
const DEFAULT_MIN_TURN = Math.PI * 0.25;
const DEFAULT_MAX_TURN = Math.PI;
const DEFAULT_TARGET_LOSS_SOFTENING_SCALE = 3

const SECONDS_PER_MS = 1 / 1000

export interface SteeringData {
    turnSoftening: number
    deadZone: number
    maxVelM: number
    minVelM: number
    accelM: number
    decelM: number
    minTurnR: number
    maxTurnR: number
}

export const DEFAULT_STEERING_DATA: SteeringData = Object.freeze({
    maxVelR: DEFAULT_MAX_VEL_R,
    turnSoftening: DEFAULT_TURN_SOFTENING,
    deadZone: DEFAULT_DEAD_ZONE,
    maxVelM: 0,
    minVelM: 0,
    accelM: 0,
    decelM: 0,
    minTurnR: DEFAULT_MIN_TURN,
    maxTurnR: DEFAULT_MAX_TURN,
})

const selfVector = Vector2.createFromCoordinates(0, 1)
const targetVector = Vector2.createFromCoordinates(0, 1)

export function steerTowardsEntity(gameState: GameState, self: Entity, target: Entity | undefined, data: SteeringData) {
    // Initialize unset values
    data.maxVelM = data.maxVelM || self.velMI
    data.minVelM = data.minVelM || data.maxVelM * DEFAULT_MIN_VEL_SCALE

    const velRange = data.maxVelM - data.minVelM
    const positionInSpeedRange = velRange === 0 ? 1 : ExtraMath.clamp(0, ((self.velMI - data.minVelM) / (data.maxVelM - data.minVelM)), 1)
    const maxTurnAtCurrentSpeed = ((1 - positionInSpeedRange) * (data.maxTurnR - data.minTurnR)) + data.minTurnR

    if (!target) {
        self.velRL *= 1 - ((gameState.frameLength * SECONDS_PER_MS) * DEFAULT_TARGET_LOSS_SOFTENING_SCALE)
        return
    }

    Vector2.setToCoordinates(selfVector, self.posXG, self.posYG)
    Vector2.setToCoordinates(targetVector, target.posXG, target.posYG)
    Vector2.subtract(targetVector, selfVector)
    Vector2.rotateBy(targetVector, -self.posRG)

    const angleToTarget = ExtraMath.moduloBetween(Vector2.angleOf(targetVector), -Math.PI, Math.PI)
    const turnSoftening = data.turnSoftening || 0.1
    let clampedAngle = ExtraMath.clamp(-turnSoftening, angleToTarget, turnSoftening)
    if (-data.deadZone < clampedAngle && clampedAngle < data.deadZone) {
        clampedAngle = 0
    }
    const scale = clampedAngle / turnSoftening

    // Adjust rotational velocity
    self.velRL = maxTurnAtCurrentSpeed * scale
    self.velRL = ExtraMath.clamp(-maxTurnAtCurrentSpeed, self.velRL, maxTurnAtCurrentSpeed)

    // Adjust translational velocity
    const desiredVel = ((1 - Math.abs(scale)) * (data.maxVelM - data.minVelM)) + data.minVelM
    const desiredVelClamped = ExtraMath.clamp(data.minVelM, desiredVel, data.maxVelM)
    if (desiredVelClamped < self.velMI) {
        self.velMI = Math.max(desiredVelClamped, self.velMI + (-data.decelM * gameState.frameLength * SECONDS_PER_MS))
    } else if (desiredVelClamped > self.velMI) {
        self.velMI = Math.min(desiredVelClamped, self.velMI + (data.accelM * gameState.frameLength * SECONDS_PER_MS))
    }
}
