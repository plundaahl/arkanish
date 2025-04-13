import { GameEvent } from "../../game-state/GameEvent";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Flag } from "../../game-state/Flag";
import { ExplosionRedParticle } from "../particles/ExplosionRedParticle";

export const BulletScript = {
    id: 'Bullet',
    update: (world: GameState, entity: Entity): void => {
        if (entity.posY < (world.playArea.top)) {
            Entity.killEntity(entity)
        }
    },
    handleEvent: (gameState: GameState, bullet: Entity, event: GameEvent): void => {
        if (GameEvent.isCollisionEvent(event)) {
            const target = World.getEntity(gameState, event.hitBy)
            if (!target) {
                return
            }

            if (Flag.hasBigintFlags(target.flags, EntityFlags.KILLS_PLAYER_BULLETS)) {
                Entity.killEntity(bullet)
            }

            if ((bullet.flags & EntityFlags.ROLE_PLAYER_BULLET)
                && (target.flags & EntityFlags.HURT_BY_PLAYER_BULLETS)
            ) {
                Entity.killEntity(target)

                const numParticles = Math.ceil(Math.random() * 10) + 5
                for (let i = 0; i < numParticles; i++) {
                    ExplosionRedParticle.spawn(gameState, target, 100)
                }

                gameState.score += 10
            }
        }
    }
}
