import { GameEvent } from "../game-state/GameEvent";
import { Entity, EntityFlags, World } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";

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
                gameState.score += 10
            }
        }
    }
}
