import { Script } from "../../game-state/Script";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Prefab } from "../../game-state/Prefab";
import { AsteroidSpawnerScriptHandler } from "../scripts";

export const AsteroidSpawnerPrefab: Prefab = {
    id: "AsteroidSpawner",
    spawn: (gameState: GameState): Entity => {
        const entity = World.spawnEntity(gameState)
        entity.flags |= EntityFlags.DESTROY_AFTER_SECTION
        Script.attach(gameState, entity, AsteroidSpawnerScriptHandler)
        return entity
    }
}
