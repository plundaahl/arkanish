import { GameState } from "./game-state/GameState"
import { UiState } from "./ui-state"
import { RenderCommandBuffer } from "./RenderCommand"
import {
    CollisionSystem,
    DamageSystem,
    EventSystem,
    InputSystem,
    LevelSystem,
    MovementSystem,
    ParticleSystem,
    PlayAreaFlagSystem,
    RenderSystem,
    SceneSystem,
    ScriptSystem,
    SpawnSystem,
    TimeSystem,
    UiSystem,
} from "./systems"

export const Engine = {
    update(
        state: GameState,
        uiState: UiState,
        systemTime: number,
        gameObjBuffer: RenderCommandBuffer,
        uiBuffer: RenderCommandBuffer,
        canvas: CanvasRenderingContext2D,
    ) {
        SceneSystem.run(state, uiState)
        InputSystem.run(state, uiState)
        UiSystem.run(state, uiState, uiBuffer)
        TimeSystem.run(state, systemTime)
        LevelSystem.run(state)
        SpawnSystem.runSpawn(state)
        if (state.running) {
            MovementSystem.run(state)
            CollisionSystem.run(state)
        }
        PlayAreaFlagSystem.run(state)
        if (state.running) {
            EventSystem.run(state)
            DamageSystem.run(state)
            ScriptSystem.run(state)
        }
        SpawnSystem.runDespawn(state)
        ParticleSystem.render(state, gameObjBuffer)
        RenderSystem.render(state, uiState, gameObjBuffer, uiBuffer, canvas)
    },
}
