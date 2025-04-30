import { GameState } from "../../game-state/GameState"
import { RenderCommandBuffer } from "../../RenderCommand"
import { renderText } from "../../systems"
import { Entity } from "../../game-state/Entity"
import { DebugFlags } from "../../game-state/DebugState"

export function statusText(buffer: RenderCommandBuffer, gameState: GameState, player?: Entity) {
    const text = [
        `HP: ${player?.hp || 0}`,
        `Score: ${gameState.score}`,
    ]

    if (gameState.debugFlags & DebugFlags.DEV_MODE) {
        text.push(
            '---',
            `Section Time: ${gameState.gameTime - gameState.levelSectionTimeStart}`,
            `Intensity: ${gameState.intensity} / ${gameState.intensityBudget}`,
        )
    }

    RenderCommandBuffer.addCustomRenderCmd(
        buffer,
        1000,
        renderText,
        text,
        35,
        50,
    )
}
