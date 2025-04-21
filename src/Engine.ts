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
    RenderSystem,
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
        TimeSystem.run(state, systemTime)
        LevelSystem.run(state)
        SpawnSystem.runSpawn(state)
        InputSystem.run(state, uiState)
        MovementSystem.run(state)
        CollisionSystem.run(state)
        EventSystem.run(state)
        DamageSystem.run(state)
        ScriptSystem.run(state)
        SpawnSystem.runDespawn(state)
        UiSystem.run(state, uiBuffer)
        ParticleSystem.render(state, gameObjBuffer)
        RenderSystem.render(state, uiState, gameObjBuffer, uiBuffer, canvas)
    },
}
