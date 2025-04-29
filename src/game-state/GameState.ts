import { Collisions } from './Collisions'
import { DebugState } from './DebugState'
import { World } from './Entity'
import { FrameState } from './Frame'
import { GameEventBuffer } from './GameEvent'
import { LevelState } from './Level'
import { ParticleState } from './Particles'
import { PlayAreaState } from './PlayArea'
import { SceneState } from './Scene'

export type GameState = World
    & GameEventBuffer
    & Collisions
    & FrameState
    & ParticleState
    & LevelState
    & PlayAreaState
    & SceneState
    & DebugState
    & {
    playerId: number,
    playerNextShotTime: number,
    lastSpawnTime: number,
    numEntities: number,
    score: number,
    scoreTimeIncrementer: number,
}

export const GameState = {
    create(time: number): GameState {
        const state = {
            ...World.create(),
            ...GameEventBuffer.create(),
            ...Collisions.create(),
            ...FrameState.create(time),
            ...ParticleState.create(),
            ...LevelState.create(),
            ...PlayAreaState.create(),
            ...SceneState.create(),
            ...DebugState.create(),
            playerId: 0,
            lastSpawnTime: time,
            numEntities: 0,
            playerNextShotTime: 0,
            score: 0,
            scoreTimeIncrementer: 0,
        }
        return state
    },
    reset(gameState: GameState): void {
        World.reset(gameState)
        ParticleState.reset(gameState)
        LevelState.reset(gameState)
        GameEventBuffer.reset(gameState)
        gameState.numEntities = 0
    },
}
