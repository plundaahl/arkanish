import { GameState } from "../../game-state/GameState"
import { Entity } from "../../game-state/Entity"
import { Particle, ParticleState } from "../../game-state/Particles"
import { RenderCommandBuffer } from "../../RenderCommand"
import { renderBox } from "../../systems/RenderSystem"
import { Vector2 } from "../../game-state/Vector"

function scaleOffset(from: number, offset: number, by: number): number {
    return from + (offset * by)
}

export function createBoxParticleRenderFn(colour: string) {
    return function renderExplosionWhiteParticle(renderBuffer: RenderCommandBuffer, particle: Particle, time: number, entity?: Entity) {
        const length = particle.endTime - particle.startTime
        if (length === 0) {
            return
        }
        const pos = (time - particle.startTime) / length
    
        const size = scaleOffset(10, -8, pos)
        const halfSize = size * 0.5
    
        RenderCommandBuffer.addCustomRenderCmd(
            renderBuffer,
            particle.originZ,
            renderBox,
            colour,
            false,
            scaleOffset(
                particle.originX + (entity?.posXG || 0),
                particle.vecX + (entity?.posXG || 0),
                pos
            ) - halfSize,
            scaleOffset(
                particle.originY + (entity?.posYG || 0),
                particle.vecY + (entity?.posYG || 0),
                pos
            ) - halfSize,
            size,
            size,
        )
    }
}

export function spawnExplosionParticle(state: GameState, entity: Entity, radius: number, lifetime: number) {
    const particle = ParticleState.provisionParticle(state, state.time)
    particle.originZ = entity.posZL + 1
    particle.originX = entity.posXG
    particle.originY = entity.posYG
    const angle = Math.random() * 2 * Math.PI
    const magntiude = (Math.random() * radius * 0.5) + (radius * 0.5)
    const vec = Vector2.createFromAngle(angle, magntiude)
    particle.vecX = Vector2.xOf(vec)
    particle.vecY = Vector2.yOf(vec)
    particle.endTime = state.time + lifetime
    return particle
}
