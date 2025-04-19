import { GameEvent, GameEventBuffer } from "../game-state/GameEvent";
import { GameState } from "../game-state/GameState";
import { Entity, EntityFlags, EntityStates, World } from "../game-state/Entity";
import { Flag } from "../game-state/Flag";

export const DamageSystem = {
    run(gameState: GameState) {
        for (let i = 0; i < gameState.publishedEvents.length; i++) {
            const event = gameState.publishedEvents[i];
            if (!GameEvent.isCollisionEvent(event)) {
                continue
            }

            const entity = World.getEntity(gameState, event.entity)
            const hitBy = World.getEntity(gameState, event.hitBy)

            if (entity
                && hitBy
                && entity.state === EntityStates.ALIVE
                && !Flag.hasBigintFlags(entity.flags, EntityFlags.INVULNERABLE)
                && entity.hurtBy & hitBy.flags
            ) {
                entity.hp = Math.max(entity.hp - 1, 0)
                GameEventBuffer.addDamageEvent(gameState, entity.id)
                if (entity.hp <= 0 && Flag.hasBigintFlags(entity.flags, EntityFlags.DESTROY_AT_0_HP)) {
                    Entity.killEntity(entity)
                }
            }
        }
    },
}
