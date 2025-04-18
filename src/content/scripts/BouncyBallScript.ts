import { GameEvent } from "../../game-state/GameEvent";
import { Entity } from "../../game-state/Entity";
import { BoundingBox } from "../../game-state/BoundingBox";
import { BlastCircleParticle } from "../../content/particles/BlastCircleParticle";
import { TelegraphCircleParticle } from "../../content/particles/TelegraphCircleParticle";
import { ExplosionWhiteParticle } from "../../content/particles/ExplosionWhiteParticle";
import { createStateMachineHandler, StateMachineScript, transitionScript } from "./StateMachineScript";

const DETONATION_TIME = 1000
const BLAST_RADIUS = 150
const BLAST_FADE = 400
const NUM_EXPLOSION_PARTICLES = 20

export const stateBouncing: StateMachineScript<'BouncyBall'> = {
    type: "BouncyBall",
    onEvent(gameState, entity, event) {
        if (GameEvent.isCollisionEvent(event)) {
            entity.hp -= 1
            if (entity.hp <= 1) {
                TelegraphCircleParticle.spawn(gameState, entity, BLAST_RADIUS, DETONATION_TIME)
                transitionScript(gameState, entity, stateTelegraphing)
            }
        }
    },
}

export const stateTelegraphing: StateMachineScript<'BouncyBall'> = {
    type: "BouncyBall",
    onUpdate(gameState, entity) {
        const timeInState = gameState.time - entity.scriptData.timeEnteredState

        if (timeInState > DETONATION_TIME) {
            transitionScript(gameState, entity, stateDetonating)
            entity.colliderBbSrc[0] = BoundingBox.createCircleBb(0, 0, BLAST_RADIUS)
            entity.colliderBbTransform[0] = BoundingBox.clone(entity.colliderBbSrc[0])
            BlastCircleParticle.spawn(gameState, entity, BLAST_RADIUS, BLAST_FADE)
            for (let i = 0; i < NUM_EXPLOSION_PARTICLES; i++) {
                ExplosionWhiteParticle.spawn(gameState, entity, BLAST_RADIUS)
            }
            Entity.killEntity(entity)
        }
    },
}

export const stateDetonating: StateMachineScript<'BouncyBall'> = {
    type: "BouncyBall"
}

export const BouncyBallScriptHandler = createStateMachineHandler('BouncyBall', stateBouncing)
