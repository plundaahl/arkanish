import { GameState } from "../../game-state/GameState";
import { Entity } from "../../game-state/Entity";
import { Particle, ParticleHandler, ParticleState } from "../../game-state/Particles";
import { RenderCommandBuffer } from "../../RenderCommand";
import { renderBeam } from "../../systems/RenderSystem";

export const TelegraphBeamParticle = {
    id: 'TelegraphBeam',
    render: function (renderBuffer: RenderCommandBuffer, particle: Particle, time: number, entity?: Entity): void {
        const length = particle.endTime - particle.startTime
        if (length === 0) {
            return
        }

        const animationPos = (time - particle.startTime) / length
        const opacity = Math.pow(animationPos, 2)
        const w = animationPos * particle.variation
        const r = Math.atan2(particle.vecY, particle.vecX)

        RenderCommandBuffer.addCustomRenderCmd(
            renderBuffer,
            particle.originZ + (entity?.posZL || 0),
            renderBeam,
            '#600',
            true,
            opacity,
            particle.originX + (entity?.posXG || 0),
            particle.originY + (entity?.posYG || 0),
            w,
            r + (entity?.posRG || 0),
        )
    },
    spawn: function (state: GameState, entity: Entity, x: number, y: number, w: number, r: number, delay: number): Particle {
        const particle = ParticleState.provisionParticle(state, state.time)
        particle.type = TelegraphBeamParticle.id
        particle.attachedToEntity = entity ? entity.id : 0
        particle.originZ = -1
        particle.originX = x
        particle.originY = y
        particle.variation = w
        particle.vecX = Math.cos(r)
        particle.vecY = Math.sin(r)
        particle.endTime = state.time + delay
        return particle
    }
}

const assert: ParticleHandler = TelegraphBeamParticle