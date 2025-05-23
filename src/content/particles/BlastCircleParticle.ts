import { renderCircle } from "../../systems/RenderSystem"
import { Entity } from "../../game-state/Entity"
import { GameState } from "../../game-state/GameState"
import { Particle, ParticleHandler, ParticleState } from "../../game-state/Particles"
import { RenderCommandBuffer } from "../../RenderCommand"

export const BlastCircleParticle = {
    id: 'BlastCircleParticle',
    render: function (renderBuffer: RenderCommandBuffer, particle: Particle, time: number, entity?: Entity): void {
        const length = particle.endTime - particle.startTime
        if (length === 0) {
            return
        }
        const opacity = Math.pow(1 - ((time - particle.startTime) / length), 2)
        const size = Math.sqrt((particle.vecX * particle.vecX) + (particle.vecY * particle.vecY))

        RenderCommandBuffer.addCustomRenderCmd(
            renderBuffer,
            particle.originZ + (entity?.posZL || 0),
            renderCircle,
            'white',
            true,
            particle.originX + (entity?.posXG || 0),
            particle.originY + (entity?.posYG || 0),
            size,
            opacity,
        )
    },
    spawn: (state: GameState, entity: Entity, radius: number, delay: number): Particle => {
        const particle = ParticleState.provisionParticle(state, state.gameTime)
        particle.type = BlastCircleParticle.id
        particle.originZ = entity.posZL - 1
        particle.originX = entity.posXL
        particle.originY = entity.posYL
        particle.vecX = radius
        particle.endTime = state.gameTime + delay
        return particle
    }
}

const assert: ParticleHandler = BlastCircleParticle