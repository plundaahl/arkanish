import { Particle, ParticleState } from "../game-state/Particles";
import { GameState } from "../game-state/GameState";
import { RenderCommandBuffer } from "../RenderCommand";
import { World } from "../game-state/Entity";

export const ParticleSystem = {
    render: (state: GameState, renderBuffer: RenderCommandBuffer) => {
        // Clean up expired particles
        for (let i = state.liveParticles.length; i >= 0; i--) {
            const particle = state.liveParticles[i]
            const particleIsExpired = particle && state.gameTime > particle.endTime
            const particleEntityNoLongerExists = particle && particle.attachedToEntity > 0 && !World.getEntity(state, particle.attachedToEntity)
            if (particleIsExpired || particleEntityNoLongerExists) {
                ParticleState.releaseParticle(state, i)
            }
        }

        // Render
        for (const particle of state.liveParticles) {
            const attachedEntity = particle.attachedToEntity ? World.getEntity(state, particle.attachedToEntity) : undefined
            const handler = Particle.getHandlerForId(particle.type)
            if (handler) {
                handler.render(renderBuffer, particle, state.gameTime, attachedEntity)
            }
        }
    },
}
