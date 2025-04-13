import { GameEvent } from "../../game-state/GameEvent";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { spawnBlastBeamParticle, spawnTelegraphBeamParticle } from "../../particles";
import { Script } from "../../game-state/Script";
import { ExtraMath } from "../../Math";

const PREPARE_TIME = 800
const TELEGRAPH_TIME = 2000
const BLAST_TIME = 300
const BLAST_PARTICLE_TIME = BLAST_TIME * 2
const LINGER_TIME = BLAST_PARTICLE_TIME - BLAST_TIME

export const BeamSpinnerScript = {
    id: 'BeamSpinner',
    IDLE: 0,
    PREPARING: 1,
    TELEGRAPHING: 2,
    BLASTING: 3,
    LINGERING: 4,
    update: (state: GameState, entity: Entity) => {
        const timeInState = state.time - entity.scriptTimeEnteredState
        if (entity.scriptState === BeamSpinnerScript.IDLE) {
            if (entity.posY > state.playArea.top) {
                Script.transitionTo(state, entity, BeamSpinnerScript.PREPARING)
                // Wait a random amount of time before triggering
                entity.scriptTimeEnteredState -= Math.abs(ExtraMath.rollBetween(0, 0.4) * state.playArea.height / entity.velY)
            }
        } else if (entity.scriptState === BeamSpinnerScript.PREPARING) {
            if (timeInState > PREPARE_TIME) {
                spawnTelegraphBeamParticle(state, entity, 0, 0, 50, 0, TELEGRAPH_TIME)
                spawnTelegraphBeamParticle(state, entity, 0, 0, 50, Math.PI, TELEGRAPH_TIME)
                Script.transitionTo(state, entity, BeamSpinnerScript.TELEGRAPHING)
            }
        } else if (entity.scriptState === BeamSpinnerScript.TELEGRAPHING) {
            if (timeInState > TELEGRAPH_TIME) {
                spawnBlastBeamParticle(state, entity, 0, 0, 50, 0, BLAST_PARTICLE_TIME)
                spawnBlastBeamParticle(state, entity, 0, 0, 50, Math.PI, BLAST_PARTICLE_TIME)
                entity.flags |= EntityFlags.COLLIDER
                Script.transitionTo(state, entity, BeamSpinnerScript.BLASTING)
                const parent = World.getEntity(state, entity.parent)
                if (parent) {
                    parent.flags ^= EntityFlags.COLLIDER
                }
            }
        } else if (entity.scriptState === BeamSpinnerScript.BLASTING) {
            if (timeInState > BLAST_TIME) {
                entity.flags ^= EntityFlags.COLLIDER
                Script.transitionTo(state, entity, BeamSpinnerScript.LINGERING)
            }
        } else if (entity.scriptState === BeamSpinnerScript.LINGERING) {
            if (timeInState > LINGER_TIME) {
                const parent = World.getEntity(state, entity.parent)
                if (parent) {
                    Entity.killEntity(parent)
                }
                Entity.killEntity(entity)
            }
        }
    },
    handleEvent: (state: GameState, entity: Entity, event: GameEvent): void => {}
}
