import { GameEvent } from "../game-state/GameEvent";
import { Entity, EntityFlags, World } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";

export const BulletScript = {
    update: (world: GameState, entity: Entity): void => {},
    handleEvent: (gameState: GameState, self: Entity, event: GameEvent): void => {
        if (GameEvent.isCollisionEvent(event)) {
            const other = World.getEntity(gameState, event.hitBy)
            if (!other) {
                return
            }

            if ((self.flags & EntityFlags.ROLE_PLAYER_BULLET)
                && (other.flags & EntityFlags.ROLE_ENEMY)
            ) {
                self.flags |= EntityFlags.DYING
                other.flags |= EntityFlags.DYING
                gameState.score += 50
            }
        }
    }
}
