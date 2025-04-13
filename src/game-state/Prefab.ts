import { Entity } from "./Entity";
import { GameState } from "./GameState";

export interface Prefab {
    id: string,
    spawn: (gameState: GameState) => Entity,
}

const prefabRegistry: { [Id in string]: Prefab } = {}

export const PrefabRegistry = {
    registerPrefabs: (...prefabs: Prefab[]) => {
        for (const prefab of prefabs) {
            const existingPrefab = prefabRegistry[prefab.id]
            if (Object.is(existingPrefab, prefab)) {
                console.warn(`Re-registered Prefab with ID [${prefab.id}].  This is redundant and you should probably fix it.`)
            } else if (existingPrefab !== undefined) {
                throw new Error(`Tried to register at least two Prefabs with ID [${prefab.id}].`)
            }
            prefabRegistry[prefab.id] = prefab
        }
    },
}

export const Prefab = {
    spawn: (state: GameState, prefabName: string): Entity => {
        const prefab = prefabRegistry[prefabName]
        if (!prefab) {
            throw new Error(`No Prefab found with ID [${prefabName}].`)
        }
        return prefab.spawn(state)
    },
}