import { Script } from "../../game-state/Script";
import { Entity, World } from "../../game-state/Entity";
import { Prefab, PrefabParameters } from "../../game-state/Prefab";
import { JetEmitterScriptHandler } from "../scripts";

interface JetEmitterParameters extends PrefabParameters {
    distance: number,
    lifetime: number,
    rate: number,
}

export const JetEmitterPrefab: Prefab<JetEmitterParameters> = {
    id: "JetEmitter",
    spawn(gameState, parent, parameters): Entity {
        const entity = World.spawnEntity(gameState, parent)
        const distance = parameters?.distance
        const lifetime = parameters?.lifetime
        const rate = parameters?.rate

        const scriptParams = parameters
            ? { distance, lifetime, rate }
            : undefined

        Script.attach(gameState, entity, JetEmitterScriptHandler, scriptParams)
        return entity
    }
}