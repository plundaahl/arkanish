import { GameEvent } from "../game-state/GameEvent";
import { Entity, EntityFlags, World } from "../game-state/Entity";
import { GameState } from "../game-state/GameState";
import { Script } from "./Script";
import { Flag } from "../game-state/Flag";

const TIME_INVULNERABLE_AFTER_HIT = 1000
const TIME_DYING = 1500
const PLAYER_MAX_HP = 3

export const PlayerScript = {
    id: 'Player',
    ACTIVE: 0,
    INVULNERABLE: 1,
    DYING: 2,
    update: (gameState: GameState, entity: Entity) => {
        switch (entity.scriptState) {
            case PlayerScript.ACTIVE:
                break
            case PlayerScript.INVULNERABLE:
                if (gameState.time > entity.scriptTimeEnteredState + TIME_INVULNERABLE_AFTER_HIT) {
                    Script.transitionTo(gameState, entity, PlayerScript.ACTIVE)
                }
                break
            case PlayerScript.DYING:
                if (gameState.time > entity.scriptTimeEnteredState + TIME_DYING) {
                    Entity.killEntity(entity)
                }
                break
        }
    },
    handleEvent: (gameState: GameState, entity: Entity, event: GameEvent): void => {
        if (GameEvent.isCollisionEvent(event)) {
            const other = World.getEntity(gameState, event.hitBy)
            if (!other) {
                return
            }

            if (Flag.hasBigintFlags(other.flags, EntityFlags.ROLE_ENEMY) && entity.scriptState === PlayerScript.ACTIVE) {
                entity.hp -= 1
                Script.transitionTo(gameState, entity,
                    entity.hp > 0
                        ? PlayerScript.INVULNERABLE
                        : PlayerScript.DYING
                )
            } else if (Flag.hasBigintFlags(other.flags, EntityFlags.ROLE_POWERUP) && entity.scriptState != PlayerScript.DYING) {
                entity.hp = Math.min(entity.hp + 1, PLAYER_MAX_HP)
            }
        }
    },
}
