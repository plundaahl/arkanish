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
                && entity.hurtBy & hitBy.flags
            ) {
                const hitByPlayerBullet = Boolean(hitBy.flags & EntityFlags.ROLE_PLAYER_BULLET)
                applyDamageToEntity(gameState, entity, hitByPlayerBullet)

                let currentEntity: Entity | undefined = entity
                while (currentEntity && currentEntity.flags & EntityFlags.PROPAGATE_DAMAGE_TO_PARENT) {
                    currentEntity = World.getEntity(gameState, currentEntity.parent)
                    if (currentEntity) {
                        applyDamageToEntity(gameState, currentEntity, hitByPlayerBullet)
                    }
                }
            }
        }
    },
}

function applyDamageToEntity(gameState: GameState, entity: Entity, hitByPlayerBullet: boolean) {
    if (Flag.hasBigintFlags(entity.flags, EntityFlags.INVULNERABLE)) {
        return
    }
    if (entity.flags & EntityFlags.INVULNERABLE_AFTER_HIT && entity.lastHit >= gameState.gameTime) {
        return
    }

    entity.hp = Math.max(entity.hp - 1, 0)
    entity.lastHit = gameState.gameTime
    const killingHit = entity.hp <= 0 && Flag.hasBigintFlags(entity.flags, EntityFlags.DESTROY_AT_0_HP)

    GameEventBuffer.addDamageEvent(gameState, entity.id, killingHit)
    if (killingHit) {
        Entity.killEntity(entity)
        if (entity.scoreValue > 0 && hitByPlayerBullet) {
            gameState.score += entity.scoreValue
            entity.scoreValue = 0
        }
    }
    propagateEventsToParent(gameState, entity, killingHit)
}

function propagateEventsToParent(gameState: GameState, entity: Entity, deathEvent: boolean) {
    for (
        let parent = World.getEntity(gameState, entity.parent);
        parent != undefined;
        entity = parent, parent = World.getEntity(gameState, entity.parent)
    ) {
        if (deathEvent && entity.flags & EntityFlags.PROPAGATE_DEATH_TO_PARENT) {
            Entity.killEntity(parent)
            GameEventBuffer.addDamageEvent(gameState, parent.id, deathEvent)
        } else {
            return
        }
    }
}
