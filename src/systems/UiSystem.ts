import { World } from "../game-state/Entity"
import { RenderCommandBuffer } from "../RenderCommand"
import { renderText } from "./RenderSystem"
import { GameState } from "../game-state/GameState"

export const UiSystem = {
    run(state: GameState, buffer: RenderCommandBuffer) {
        const player = World.getEntity(state, state.playerId)
        const hpText = `HP: ${player?.hp || 0}`
        const scoreText = `Score: ${state.score}`
        // const frameRate = `Framerate: ${Math.round(100000 / this.state.frameLength) * 0.01}`
        RenderCommandBuffer.addCustomRenderCmd(buffer, 1000, renderText, [hpText, scoreText])
    },
}
