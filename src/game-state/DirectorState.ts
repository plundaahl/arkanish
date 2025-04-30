export type DirectorState = {
    intensity: number
    intensityBudget: number
}

export const DirectorState = {
    create(): DirectorState {
        return {
            intensity: 0,
            intensityBudget: 100,
        }
    }
}
