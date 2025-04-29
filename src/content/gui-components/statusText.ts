import { RenderCommandBuffer } from "../../RenderCommand"
import { renderText } from "../../systems"

export function statusText(buffer: RenderCommandBuffer, score: number, hp?: number) {
    const hpText = `HP: ${hp || 0}`
    const scoreText = `Score: ${score}`
    RenderCommandBuffer.addCustomRenderCmd(buffer, 1000, renderText, [hpText, scoreText])
}
