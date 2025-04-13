import { GameState } from "../../game-state/GameState";
import { Entity } from "../../game-state/Entity";
import { Particle, ParticleHandler } from "../../game-state/Particles";
import { createBoxParticleRenderFn, spawnExplosionParticle } from "./util";

export const ExplosionWhiteParticle = {
    id: "ExplosionWhiteParticle",
    render: createBoxParticleRenderFn('white'),
    spawn: (state: GameState, entity: Entity, radius: number): Particle => {
        const particle = spawnExplosionParticle(state, entity, radius, 250)
        particle.type = ExplosionWhiteParticle.id
        return particle
    },
}

const assertion: ParticleHandler = ExplosionWhiteParticle