import { GameEvent } from "../../game-state/GameEvent";
import { Entity, World } from "../../game-state/Entity";
import { ExplosionRedParticle } from "../particles/ExplosionRedParticle";
import { ScriptHandler } from "../../game-state/Script";

export const BulletScriptHandler: ScriptHandler<'Bullet', {}> = {
    type: "Bullet",
    nullData: {},
    script: {
        type: "Bullet",
        onEvent(gameState, bullet, event) {
            if (GameEvent.isCollisionEvent(event)) {
                const target = World.getEntity(gameState, event.hitBy)
                if (!target) {
                    return
                }
    
                if (target.hurtBy & bullet.flags) {
                    gameState.score += 10

                    const numParticles = Math.ceil(Math.random() * 10) + 5
                    for (let i = 0; i < numParticles; i++) {
                        ExplosionRedParticle.spawn(gameState, target, 100)
                    }
                }
            }
        },
        onUpdate(gameState, entity) {
            if (entity.posY < (gameState.playArea.top)) {
                Entity.killEntity(entity)
            }
        },
    },
    serializeData(): Object {
        return {}
    },
    deserializeData(): {} | undefined {
        return {}
    },
}
