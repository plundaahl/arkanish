import { Entity } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Particle, ParticleHandler, ParticleState } from "../../game-state/Particles";
import { RenderCommandBuffer } from "../../RenderCommand";
import { renderCircle } from "../../systems/RenderSystem";

export const TelegraphCircleParticle = {
    id: 'TelegraphCircleParticle',
    render: (renderBuffer: RenderCommandBuffer, particle: Particle, time: number, entity?: Entity): void => {
        const length = particle.endTime - particle.startTime
        if (length === 0) {
            return
        }
        const opacity = Math.pow((time - particle.startTime) / length, 2)
        const size = Math.sqrt((particle.vecX * particle.vecX) + (particle.vecY * particle.vecY))
        let x = particle.originX
        let y = particle.originY
        if (entity) {
            x += entity.transX
            y += entity.transY
        }

        RenderCommandBuffer.addCustomRenderCmd(
            renderBuffer,
            particle.originZ + (entity?.posZ || 0),
            renderCircle,
            '#600',
            true,
            x,
            y,
            size,
            opacity,
        )
    },
    spawn: (state: GameState, entity: Entity, radius: number, delay: number): Particle => {
        const particle = ParticleState.provisionParticle(state, state.time)
        particle.type = TelegraphCircleParticle.id
        particle.attachedToEntity = entity ? entity.id : 0
        particle.vecX = radius
        particle.endTime = state.time + delay
        return particle
    },
}

const assertion: ParticleHandler = TelegraphCircleParticle