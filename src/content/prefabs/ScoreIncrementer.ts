import { Script } from "../../game-state/Script";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Prefab } from "../../game-state/Prefab";
import { ScoreIncrementerScriptHandler } from "../scripts";

export const ScoreIncrementerPrefab: Prefab = {
    id: "ScoreIncrementer",
    spawn(gameState, parent): Entity {
        const entity = World.spawnEntity(gameState, parent)
        entity.flags |= EntityFlags.SCRIPT
        Script.attach(gameState, entity, ScoreIncrementerScriptHandler)
        return entity
    }
}
