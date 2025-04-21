import { Script } from "../../game-state/Script";
import { Entity, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Prefab } from "../../game-state/Prefab";
import { JetEmitterScriptHandler } from "../scripts";

export const JetEmitterPrefab: Prefab = {
    id: "JetEmitter",
    spawn(gameState: GameState): Entity {
        const entity = World.spawnEntity(gameState)
        Script.attach(gameState, entity, JetEmitterScriptHandler)
        return entity
    }
}