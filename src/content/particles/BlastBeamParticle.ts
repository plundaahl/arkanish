import { GameState } from "../../game-state/GameState";
import { Entity } from "../../game-state/Entity";
import { Particle, ParticleHandler, ParticleState } from "../../game-state/Particles";
import { RenderCommandBuffer } from "../../RenderCommand";
import { renderBeam } from "../../systems/RenderSystem";

export const BlastBeamParticle = {
    id: 'BlastBeam',
    render: function (renderBuffer: RenderCommandBuffer, particle: Particle, time: number, entity?: Entity): void {
        const length = particle.endTime - particle.startTime
        if (length === 0) {
            return
        }

        const animationPos = (time - particle.startTime) / length
        const opacity = 1 - Math.pow(animationPos, 2)
        const w = particle.variation
        const r = Math.atan2(particle.vecY, particle.vecX)

        RenderCommandBuffer.addCustomRenderCmd(
            renderBuffer,
            particle.originZ + (entity?.posZ || 0),
            renderBeam,
            'white',
            true,
            opacity,
            particle.originX + (entity?.transX || 0),
            particle.originY + (entity?.transY || 0),
            w,
            r + (entity?.transR || 0),
        )
    },
    spawn: (state: GameState, entity: Entity, x: number, y: number, w: number, r: number, delay: number): Particle => {
        const particle = ParticleState.provisionParticle(state, state.time)
        particle.type = BlastBeamParticle.id
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

const assert: ParticleHandler = BlastBeamParticle