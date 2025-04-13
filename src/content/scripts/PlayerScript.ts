import { GameEvent } from "../../game-state/GameEvent";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Script } from "../../game-state/Script";
import { Flag } from "../../game-state/Flag";
import { ExplosionWhiteParticle } from "../../content/particles/ExplosionWhiteParticle";
import { JetParticle } from "../particles/JetParticle";

const TIME_INVULNERABLE_AFTER_HIT = 1000
const TIME_DYING = 1500
const PLAYER_MAX_HP = 3
const MS_PER_JET_PARTICLE = 50
const PLAYER_BLAST_RADIUS = 100

let particleSpawnTime = 0

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
                    entity.colour = 'green'
                    Script.transitionTo(gameState, entity, PlayerScript.ACTIVE)
                }
                break
            case PlayerScript.DYING:
                if (particleSpawnTime < gameState.time) {
                    ExplosionWhiteParticle.spawn(gameState, entity, PLAYER_BLAST_RADIUS)
                }
                if (gameState.time > entity.scriptTimeEnteredState + TIME_DYING) {
                    Entity.killEntity(entity)
                }
                break
        }

        if (particleSpawnTime < gameState.time) {
            particleSpawnTime = gameState.time + MS_PER_JET_PARTICLE
            JetParticle.spawn(gameState, entity)
        }
    },
    handleEvent: (gameState: GameState, entity: Entity, event: GameEvent): void => {
        if (GameEvent.isCollisionEvent(event)) {
            const other = World.getEntity(gameState, event.hitBy)
            if (!other) {
                return
            }

            if (Flag.hasBigintFlags(other.flags, EntityFlags.HURTS_PLAYER) && entity.scriptState === PlayerScript.ACTIVE) {
                entity.hp -= 1

                for (let i = 0; i < 10; i++) {
                    ExplosionWhiteParticle.spawn(gameState, entity, PLAYER_BLAST_RADIUS)
                }

                entity.colour = 'white'
                if (entity.hp > 0) {
                    Script.transitionTo(gameState, entity, PlayerScript.INVULNERABLE)
                } else {
                    entity.velR = (Math.random() * (Math.PI * 4)) - (Math.PI * 2)
                    Script.transitionTo(gameState, entity, PlayerScript.DYING)
                }
            } else if (Flag.hasBigintFlags(other.flags, EntityFlags.ROLE_PICKUP) && entity.scriptState != PlayerScript.DYING) {
                entity.hp = Math.min(entity.hp + 1, PLAYER_MAX_HP)
            }
        }
    },
}
