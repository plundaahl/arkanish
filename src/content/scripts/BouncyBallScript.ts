import { GameEvent } from "../../game-state/GameEvent";
import { Entity } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { ScriptSystem } from "../../systems/ScriptSystem";
import { BoundingBox } from "../../game-state/BoundingBox";
import { BlastCircleParticle } from "../../content/particles/BlastCircleParticle";
import { TelegraphCircleParticle } from "../../content/particles/TelegraphCircleParticle";
import { ExplosionWhiteParticle } from "../../content/particles/ExplosionWhiteParticle";

const DETONATION_TIME = 1000
const BLAST_RADIUS = 150
const BLAST_FADE = 400
const NUM_EXPLOSION_PARTICLES = 20

export const BouncyBallScript = {
    id: 'BouncyBall',
    BOUNCING: 0,
    TELEGRAPHING: 1,
    DETONATING: 2,
    update: (state: GameState, entity: Entity) => {
        if (entity.scriptState === BouncyBallScript.TELEGRAPHING) {
            if (state.time > entity.scriptTimeEnteredState + DETONATION_TIME) {
                entity.scriptState = BouncyBallScript.DETONATING
                entity.colliderBbSrc[0] = BoundingBox.createCircleBb(0, 0, BLAST_RADIUS)
                entity.colliderBbTransform[0] = BoundingBox.clone(entity.colliderBbSrc[0])
                BlastCircleParticle.spawn(state, entity, BLAST_RADIUS, BLAST_FADE)
                for (let i = 0; i < NUM_EXPLOSION_PARTICLES; i++) {
                    ExplosionWhiteParticle.spawn(state, entity, BLAST_RADIUS)
                }
                Entity.killEntity(entity)
            }
        }
    },
    handleEvent: (state: GameState, entity: Entity, event: GameEvent): void => {
        if (entity.scriptState === BouncyBallScript.BOUNCING && GameEvent.isBounceEvent(event)) {
            entity.hp -= 1
            if (entity.hp <= 1) {
                TelegraphCircleParticle.spawn(state, entity, BLAST_RADIUS, DETONATION_TIME)
                ScriptSystem.enterState(state, entity, BouncyBallScript, BouncyBallScript.TELEGRAPHING)
            }
        }
    }
}
