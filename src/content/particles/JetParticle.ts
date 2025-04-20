import { GameState } from "../../game-state/GameState";
import { Entity } from "../../game-state/Entity";
import { Particle, ParticleHandler, ParticleState } from "../../game-state/Particles";
import { createBoxParticleRenderFn, spawnExplosionParticle } from "./util";

export const JetParticle = {
    id: "JetParticle",
    render: createBoxParticleRenderFn('#666'),
    spawn: (state: GameState, entity: Entity): Particle => {
        const particle = ParticleState.provisionParticle(state, state.time)
        particle.type = JetParticle.id
        particle.originZ = entity.posZL - 1
        particle.originX = entity.posXL
        particle.originY = entity.posYL
        particle.vecY = 100
        particle.vecX = (Math.random() * 20) - 10
        particle.endTime = state.time + 500
        return particle
    },
}

const assertion: ParticleHandler = JetParticle