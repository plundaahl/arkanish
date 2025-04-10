import { Vector2 } from "./game-state/Vector"
import { Entity } from "./game-state/Entity"
import { GameState } from "./game-state/GameState"
import { ParticleState, ParticleTypes } from "./game-state/Particles"

export function spawnJetParticle(state: GameState, entity: Entity) {
    const particle = ParticleState.provisionParticle(state, state.time)
    particle.type = ParticleTypes.JET
    particle.originZ = entity.posZ - 1
    particle.originX = entity.posX
    particle.originY = entity.posY
    particle.vecY = 100
    particle.vecX = (Math.random() * 20) - 10
    particle.endTime = state.time + 500
}

function spawnExplosionParticle(state: GameState, entity: Entity, radius: number, lifetime: number) {
    const particle = ParticleState.provisionParticle(state, state.time)
    particle.originZ = entity.posZ + 1
    particle.originX = entity.transX
    particle.originY = entity.transY
    const angle = Math.random() * 2 * Math.PI
    const magntiude = (Math.random() * radius * 0.5) + (radius * 0.5)
    const vec = Vector2.createFromAngle(angle, magntiude)
    particle.vecX = Vector2.xOf(vec)
    particle.vecY = Vector2.yOf(vec)
    particle.endTime = state.time + lifetime
    return particle
}

export function spawnExplosionWhiteParticle(state: GameState, entity: Entity, radius: number) {
    const particle = spawnExplosionParticle(state, entity, radius, 250)
    particle.type = ParticleTypes.EXPLOSION_WHITE
}

export function spawnExplosionRedParticle(state: GameState, entity: Entity, radius: number) {
    const particle = spawnExplosionParticle(state, entity, radius, 500)
    particle.type = ParticleTypes.EXPLOSION_RED
}

export function spawnTelegraphCircleParticle(state: GameState, entity: Entity, radius: number, delay: number) {
    const particle = ParticleState.provisionParticle(state, state.time)
    particle.type = ParticleTypes.TELEGRAPH_CIRCLE
    particle.attachedToEntity = entity ? entity.id : 0
    particle.vecX = radius
    particle.endTime = state.time + delay
}

export function spawnBlastCircleParticle(state: GameState, entity: Entity, radius: number, delay: number) {
    const particle = ParticleState.provisionParticle(state, state.time)
    particle.type = ParticleTypes.BLAST_CIRCLE
    particle.originZ = entity.posZ - 1
    particle.originX = entity.posX
    particle.originY = entity.posY
    particle.vecX = radius
    particle.endTime = state.time + delay
}
