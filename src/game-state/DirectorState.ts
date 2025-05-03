export type SpawnListing = { prefab: string, intensity: number, weight: number }
export type SpawnTable = { name: string, spawns: SpawnListing[] }

export type DirectorState = {
    intensity: number
    intensityFiltered: number
    intensityBudget: number
    enemyTableA: number
    enemyTableB: number
    forceXfade: number | undefined 
}

export const DirectorState = {
    create(): DirectorState {
        return {
            intensity: 0,
            intensityFiltered: 0,
            intensityBudget: 100,
            enemyTableA: 0,
            enemyTableB: 0,
            forceXfade: undefined,
        }
    }
}
