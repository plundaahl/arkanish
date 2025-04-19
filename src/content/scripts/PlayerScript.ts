import { GameEvent } from "../../game-state/GameEvent";
import { Entity, EntityFlags, World } from "../../game-state/Entity";
import { GameState } from "../../game-state/GameState";
import { Flag } from "../../game-state/Flag";
import { ExplosionWhiteParticle } from "../../content/particles/ExplosionWhiteParticle";
import { JetParticle } from "../particles/JetParticle";
import { createStateMachineHandler, StateMachineData, StateMachineScript, transitionScript } from "./StateMachineScript";
import { Prefab } from "../../game-state/Prefab";
import { CONTROLLER_FIRE } from "../../game-state/Script";

const TIME_INVULNERABLE_AFTER_HIT = 1000
const TIME_DYING = 1500
const PLAYER_MAX_HP = 3
const MS_PER_JET_PARTICLE = 50
const PLAYER_BLAST_RADIUS = 100
const PLAYER_RATE_OF_FIRE = 200
const PLAYER_SCALE = 2
const PLAYER_HEIGHT_HALF = PLAYER_SCALE * 15
const PLAYER_MAX_VEL = 800
const MAX_MAGNITUDE = 10

interface PlayerScriptData extends StateMachineData {
    nextParticleSpawnTime: number,
    nextShotTime: number,
}

const NULL_PLAYER_SCRIPT3_DATA: PlayerScriptData = {
    nextParticleSpawnTime: 0,
    nextShotTime: 0,
    timeEnteredState: 0
}

function onInput(
    gameState: GameState,
    entity: Entity & { scriptData: PlayerScriptData },
    moveImpulseX: number,
    moveImpulseY: number,
    controllerFlags: number
) {
    if (moveImpulseX && moveImpulseY) {           
        const offsetX = moveImpulseX - entity.posX
        const offsetY = moveImpulseY - entity.posY
        const offsetMagnitude = Math.sqrt((offsetX * offsetX) + (offsetY * offsetY))
        const proportionX = offsetMagnitude !== 0 ? offsetX / offsetMagnitude : 0
        const proportionY = offsetMagnitude !== 0 ? offsetY / offsetMagnitude : 0
        const scaling = Math.min(offsetMagnitude / MAX_MAGNITUDE, 1)

        entity.velX = proportionX * scaling * PLAYER_MAX_VEL
        entity.velY = proportionY * scaling * PLAYER_MAX_VEL
    } else {
        entity.velX = 0
        entity.velY = 0
    }

    if ((controllerFlags & CONTROLLER_FIRE) && gameState.time > entity.scriptData.nextShotTime) {
        entity.scriptData.nextShotTime = gameState.time + PLAYER_RATE_OF_FIRE
        const bullet = Prefab.spawn(gameState, 'PlayerBullet')
        bullet.posX = entity.posX
        bullet.posY = entity.posY - PLAYER_HEIGHT_HALF
    }
}

function handleEnemyCollision(
    gameState: GameState,
    entity: Entity & { scriptData: PlayerScriptData },
    other: Entity,
): void {
    if (Flag.hasBigintFlags(other.flags, EntityFlags.HURTS_PLAYER)) {
        entity.hp -= 1

        for (let i = 0; i < 10; i++) {
            ExplosionWhiteParticle.spawn(gameState, entity, PLAYER_BLAST_RADIUS)
        }

        entity.colour = 'white'
        if (entity.hp > 0) {
            transitionScript(gameState, entity, stateInvulnerable)
        } else {
            entity.velR = (Math.random() * (Math.PI * 4)) - (Math.PI * 2)
            transitionScript(gameState, entity, stateDying)
        }
    }
}

function handlePickupCollision(
    entity: Entity & { scriptData: PlayerScriptData },
    other: Entity,
): void {
    if (Flag.hasBigintFlags(other.flags, EntityFlags.ROLE_PICKUP)) {
        entity.hp = Math.min(entity.hp + 1, PLAYER_MAX_HP)
    }
}

function spawnJet(
    gameState: GameState,
    entity: Entity & { scriptData: PlayerScriptData },
) {
    if (entity.scriptData.nextParticleSpawnTime < gameState.time) {
        entity.scriptData.nextParticleSpawnTime = gameState.time + MS_PER_JET_PARTICLE
        JetParticle.spawn(gameState, entity)
    }
}

const stateActive: StateMachineScript<'Player', PlayerScriptData> = {
    type: "Player",
    onInput,
    onEvent(gameState, entity, event) {
        if (GameEvent.isCollisionEvent(event)) {
            const other = World.getEntity(gameState, event.hitBy)
            if (other) {
                handleEnemyCollision(gameState, entity, other)
                handlePickupCollision(entity, other)
            }
        }
    },
    onUpdate(gameState, entity) {
        spawnJet(gameState, entity)
    },
}

const stateInvulnerable: StateMachineScript<'Player', PlayerScriptData> = {
    type: "Player",
    onInput,
    onEvent(gameState, entity, event) {
        if (GameEvent.isCollisionEvent(event)) {
            const other = World.getEntity(gameState, event.hitBy)
            if (other) {
                handlePickupCollision(entity, other)
            }
        }
    },
    onUpdate(gameState, entity) {
        spawnJet(gameState, entity)
        if (gameState.time - entity.scriptData.timeEnteredState > TIME_INVULNERABLE_AFTER_HIT) {
            entity.colour = 'green'
            transitionScript(gameState, entity, stateActive)
        }
    },
}

const stateDying: StateMachineScript<'Player', PlayerScriptData> = {
    type: "Player",
    onUpdate(gameState, entity) {
        if (entity.scriptData.nextParticleSpawnTime < gameState.time) {
            ExplosionWhiteParticle.spawn(gameState, entity, PLAYER_BLAST_RADIUS)
        }
        if (gameState.time - entity.scriptData.timeEnteredState > TIME_DYING) {
            Entity.killEntity(entity)
        }
    },
}

export const PlayerScriptHandler = createStateMachineHandler('Player', stateActive, NULL_PLAYER_SCRIPT3_DATA)
