import { GameEvent } from "../game-state/GameEvent";
import { Entity, EntityFlags, World } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";
import { ParticleState, ParticleTypes } from "../game-state/Particles";

export const BulletScript = {
    id: 'Bullet',
    update: (world: GameState, entity: Entity): void => {},
    handleEvent: (gameState: GameState, bullet: Entity, event: GameEvent): void => {
        if (GameEvent.isCollisionEvent(event)) {
            const target = World.getEntity(gameState, event.hitBy)
            if (!target) {
                return
            }

            if ((bullet.flags & EntityFlags.ROLE_PLAYER_BULLET)
                && (target.flags & EntityFlags.ROLE_ENEMY)
            ) {
                Entity.killEntity(bullet)
                Entity.killEntity(target)

                const numParticles = Math.ceil(Math.random() * 10) + 5
                for (let i = 0; i < numParticles; i++) {
                    spawnExplosionRedParticle(gameState, target)
                }

                gameState.score += 10
            }
        }
    }
}

const EXPLOSION_PARTICLE_TIME = 250
function spawnExplosionRedParticle(state: GameState, entity: Entity) {
    const particle = ParticleState.provisionParticle(state, state.time)

    const travelRate = EXPLOSION_PARTICLE_TIME / 1000

    particle.type = ParticleTypes.EXPLOSION_RED
    particle.originZ = entity.posZ - 1
    particle.originX = entity.posX
    particle.originY = entity.posY
    particle.vecY = (Math.random() * 200) - 100 + (entity.velY * travelRate)
    particle.vecX = (Math.random() * 200) - 100 + (entity.velX * travelRate)
    particle.endTime = state.time + 500
}