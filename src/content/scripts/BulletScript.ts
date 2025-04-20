import { GameEvent } from "../../game-state/GameEvent";
import { Entity, World } from "../../game-state/Entity";
import { ScriptHandler } from "../../game-state/Script";
import { ExplosionRedParticle } from "../particles";

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
                    const numParticles = Math.ceil(Math.random() * 10) + 5
                    for (let i = 0; i < numParticles; i++) {
                        ExplosionRedParticle.spawn(gameState, target, 100)
                    }
                }
            }
        },
        onUpdate(gameState, entity) {
            if (entity.posYL < (gameState.playArea.top)) {
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
