import { Entity, World } from "../../game-state/Entity";
import { Prefab } from "../../game-state/Prefab";
import { SpawnPosParameters } from "./SpawnPos";

const INSET = 40
const DEFAULT_SIZE = 140

export const SpawnPosClampedAbovePrefab: Prefab<SpawnPosParameters> = {
    id: "SpawnPosClampedAbove",
    spawn(gameState, parent, parameters): Entity {
        const size = parameters?.size || DEFAULT_SIZE
        const entity = World.spawnEntity(gameState, parent)

        entity.posYL = gameState.playArea.top - size
        entity.posXL = gameState.playArea.left + Math.ceil(
            Math.random() * (gameState.playArea.width - (INSET * 2))
        )

        return entity
    }
}
