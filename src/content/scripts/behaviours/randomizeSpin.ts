import { Entity } from "../../../game-state/Entity"
import { ExtraMath } from "../../../Math"

const SPIN_MAX = 5
const SPIN_MULTIPLE = 0.2

export function randomizeSpin(entity: Entity, max: number = SPIN_MAX) {
    const spinRoll = ExtraMath.rollBetween(-max, max)
    const spin = entity.velRL + (spinRoll * SPIN_MULTIPLE)
    entity.velRL = ExtraMath.clamp(-max, spin, max)
}
