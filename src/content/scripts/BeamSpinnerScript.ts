import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { ExtraMath } from "../../Math";
import { BlastBeamParticle } from "../particles/BlastBeamParticle";
import { TelegraphBeamParticle } from "../particles/TelegraphBeamParticle";
import { createStateMachineHandler, StateMachineScript, transitionScript } from "./StateMachineScript";

const PREPARE_TIME = 800
const TELEGRAPH_TIME = 2000
const BLAST_TIME = 150
const BLAST_PARTICLE_TIME = BLAST_TIME * 4
const LINGER_TIME = BLAST_PARTICLE_TIME - BLAST_TIME

const stateIdle: StateMachineScript<'BeamSpinner'> = {
    type: "BeamSpinner",
    onUpdate(gameState, entity) {
        if (entity.posYL > gameState.playArea.top) {
            transitionScript(gameState, entity, statePreparing)
            // Wait a random amount of time before triggering
            entity.scriptData.timeEnteredState -= Math.abs(ExtraMath.rollBetween(0, 0.4) * gameState.playArea.height / entity.velYL)
        }
    },
}

const statePreparing: StateMachineScript<'BeamSpinner'> = {
    type: "BeamSpinner",
    onUpdate(gameState, entity) {
        const timeInState = gameState.gameTime - entity.scriptData.timeEnteredState
        if (timeInState > PREPARE_TIME) {
            TelegraphBeamParticle.spawn(gameState, entity, 0, 0, 50, 0, TELEGRAPH_TIME)
            TelegraphBeamParticle.spawn(gameState, entity, 0, 0, 50, Math.PI, TELEGRAPH_TIME)
            transitionScript(gameState, entity, stateTelegraphing)
        }
    },
}

const stateTelegraphing: StateMachineScript<'BeamSpinner'> = {
    type: "BeamSpinner",
    onUpdate(gameState, entity) {
        const timeInState = gameState.gameTime - entity.scriptData.timeEnteredState
        if (timeInState > TELEGRAPH_TIME) {
            BlastBeamParticle.spawn(gameState, entity, 0, 0, 50, 0, BLAST_PARTICLE_TIME)
            BlastBeamParticle.spawn(gameState, entity, 0, 0, 50, Math.PI, BLAST_PARTICLE_TIME)
            entity.flags |= EntityFlags.COLLIDER
            transitionScript(gameState, entity, stateBlasting)
            const parent = World.getEntity(gameState, entity.parent)
            if (parent) {
                parent.flags &= ~EntityFlags.COLLIDER
            }
        }
    },
}

const stateBlasting: StateMachineScript<'BeamSpinner'> = {
    type: "BeamSpinner",
    onUpdate(gameState, entity) {
        const timeInState = gameState.gameTime - entity.scriptData.timeEnteredState
        if (timeInState > BLAST_TIME) {
            entity.flags &= ~EntityFlags.COLLIDER
            transitionScript(gameState, entity, stateLingering)
        }
    },
}

const stateLingering: StateMachineScript<'BeamSpinner'> = {
    type: "BeamSpinner",
    onUpdate(gameState, entity) {
        const timeInState = gameState.gameTime - entity.scriptData.timeEnteredState
        if (timeInState > LINGER_TIME) {
            const parent = World.getEntity(gameState, entity.parent)
            if (parent) {
                Entity.killEntity(parent)
            }
            Entity.killEntity(entity)
        }
    },
}

export const BeamSpinnerScriptHandler = createStateMachineHandler('BeamSpinner', stateIdle)
