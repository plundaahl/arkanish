import { GameEvent } from "../GameEvent";
import { Entity, EntityFlags } from "../Entity";
import { World } from "../World";
import { Script } from "./Script";
import { Flag } from "../Flag";

const TIME_INVULNERABLE_AFTER_HIT = 1000
const TIME_DYING = 1500
const PLAYER_MAX_HP = 3

export const PlayerScript = {
    ACTIVE: 0,
    INVULNERABLE: 1,
    DYING: 2,
    update: (world: World, entity: Entity) => {
        switch (entity.scriptState) {
            case PlayerScript.ACTIVE:
                break
            case PlayerScript.INVULNERABLE:
                if (world.lastUpdateTime > entity.scriptTimeEnteredState + TIME_INVULNERABLE_AFTER_HIT) {
                    Script.transitionTo(world, entity, PlayerScript.ACTIVE)
                }
                break
            case PlayerScript.DYING:
                if (world.lastUpdateTime > entity.scriptTimeEnteredState + TIME_DYING) {
                    entity.flags |= EntityFlags.DYING
                }
                break
        }
    },
    handleEvent: (world: World, entity: Entity, event: GameEvent): void => {
        if (GameEvent.isCollisionEvent(event)) {
            const other = World.getEntity(world, event.hitBy)
            if (!other) {
                return
            }

            if (Flag.hasBigintFlags(other.flags, EntityFlags.ROLE_ENEMY) && entity.scriptState === PlayerScript.ACTIVE) {
                entity.hp -= 1
                Script.transitionTo(world, entity,
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
