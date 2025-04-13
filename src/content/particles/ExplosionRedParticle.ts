import { GameState } from "../../game-state/GameState";
import { Entity } from "../../game-state/Entity";
import { Particle, ParticleHandler } from "../../game-state/Particles";
import { createBoxParticleRenderFn, spawnExplosionParticle } from "./util";

export const ExplosionRedParticle = {
    id: "ExplosionRedParticle",
    render: createBoxParticleRenderFn('red'),
    spawn: (state: GameState, entity: Entity, radius: number): Particle => {
        const particle = spawnExplosionParticle(state, entity, radius, 500)
        particle.type = ExplosionRedParticle.id
        return particle
    },
}

const assertion: ParticleHandler = ExplosionRedParticle