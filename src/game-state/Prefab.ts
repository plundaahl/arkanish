import { Entity } from "./Entity";
import { GameState } from "./GameState";

export interface PrefabParameters {}

export interface Prefab<P extends PrefabParameters = PrefabParameters> {
    id: string,
    intensity?: number,
    spawn: (gameState: GameState, parent?: number, parameters?: Partial<P>) => Entity,
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
    spawn: (state: GameState, prefabName: string, parent?: number, parameters?: PrefabParameters): Entity => {
        const prefab = prefabRegistry[prefabName]
        if (!prefab) {
            throw new Error(`No Prefab found with ID [${prefabName}].`)
        }
        return prefab.spawn(state, parent, parameters)
    },
    intensityOf: (prefabName: string): number => {
        const prefab = prefabRegistry[prefabName]
        if (!prefab) {
            throw new Error(`No Prefab found with ID [${prefabName}].`)
        }
        return prefab.intensity || 0
    }
}
