import { UiState } from "../ui-state"
import { GameState } from "./GameState"

export interface SceneState {
    scene: string
    pendingScene: string
}

export const SceneState = {
    create(): SceneState {
        return {
            scene: '',
            pendingScene: '',
        }
    }
}

export interface Scene {
    id: string
    onStart?(gameState: GameState, uiState: UiState): void
    onUpdate?(gameState: GameState, uiState: UiState): void
    onEnd?(gameState: GameState, uiState: UiState): void
}

export const Scene = {
    transitionToScene(gameState: SceneState, sceneId: string) {
        gameState.pendingScene = sceneId
    },
}

const sceneRegistry: { [id: string]: Scene } = {}
export const SceneRegistry = {
    registerScenes(...scenes: Scene[]): void {
        for (const scene of scenes) {
            if (sceneRegistry[scene.id]) {
                if (Object.is(sceneRegistry[scene.id], scene)) {
                    console.warn(`Registered Scene with ID [${scene.id}] multiple times.`)
                } else {
                    throw new Error(`Tried to register Scene with ID [${scene.id}], but that ID is already in use.`)
                }
            }
            sceneRegistry[scene.id] = scene
        }
    },
    getScene(id: string): Scene {
        const scene = sceneRegistry[id]
        if (!scene) {
            throw new Error(`No Scene registered with ID [${id}].`)
        }
        return scene
    },
}
