import { ExplosionRedParticle } from "../../particles"
import { Entity } from "../../../game-state/Entity"
import { GameState } from "../../../game-state/GameState"

const RADIUS_MAX = 150
const RADIUS_MIN = 10
const PARTICLE_COUNT_MAX = 80
const PARTICLE_COUNT_MIN = 5
const PARTICLE_COUNT_MULTIPLE = (PARTICLE_COUNT_MAX - PARTICLE_COUNT_MIN) / (RADIUS_MAX - RADIUS_MIN)
const PARTICLE_RADIUS_MULTIPLE = 1.3

export function spawnExplosion(gameState: GameState, entity: Entity) {
    const particleScale = PARTICLE_COUNT_MIN + (PARTICLE_COUNT_MULTIPLE * entity.radius)
    const numParticles = Math.ceil(Math.random() * particleScale)
    for (let i = 0; i < numParticles; i++) {
        ExplosionRedParticle.spawn(gameState, entity, entity.radius * PARTICLE_RADIUS_MULTIPLE)
    }
}
