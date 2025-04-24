import { Vector2 } from "../../game-state/Vector";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { Prefab } from "../../game-state/Prefab";
import { ExtraMath } from "../../Math";
import { SpawnPosParameters } from "./SpawnPos";

const CENTER = Math.PI * 0.5
const MIN_OFFSET = Math.PI * 0.1
const MAX_ANGLE = Math.PI * 0.4
const DEFAULT_SIZE = 120
const MAX_ORIENTATION = Math.PI * 0.4

const spawnVector: Vector2 = Vector2.createFromCoordinates(1, 1)
let spawnOffsetAngle = 0

export const SpawnPosAngledAbovePrefab: Prefab<SpawnPosParameters> = {
    id: "SpawnPosAngledAbove",
    spawn(gameState, parent, parameters): Entity {
        const size = parameters?.size || DEFAULT_SIZE

        // Offset from the previous spawn position, to avoid overlapping entities
        spawnOffsetAngle = ExtraMath.moduloBetween(
            (ExtraMath.rollBetween(MIN_OFFSET, MAX_ANGLE) * ExtraMath.positiveOrNegative()) + spawnOffsetAngle,
            -MAX_ANGLE,
            MAX_ANGLE,
        )

        const spawnAngle = CENTER + spawnOffsetAngle + Math.PI
        const offsetMagnitude = Math.sqrt(Math.pow((gameState.playArea.width * 0.5) + size, 2) * 2)
        Vector2.setToAngleAndMag(spawnVector, spawnAngle, offsetMagnitude)

        const entity = World.spawnEntity(gameState, parent)

        entity.flags |= EntityFlags.DO_NOT_CLAMP_TO_WIDTH_ON_SPAWN
        entity.posXL = Vector2.xOf(spawnVector)
        entity.posYL = gameState.playArea.top - (gameState.playArea.width * -0.5) + Vector2.yOf(spawnVector)

        Vector2.scaleBy(spawnVector, -1)
        const baseAngle = Vector2.angleOf(spawnVector)
        entity.posRL = ((baseAngle - CENTER) * MAX_ORIENTATION / MAX_ANGLE) + CENTER

        return entity
    }
}
