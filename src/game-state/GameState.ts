import { Collisions } from './Collisions'
import { World } from './Entity'
import { FrameState } from './Frame'
import { GameEventBuffer } from './GameEvent'
import { ParticleState } from './Particles'

export type GameState = World
    & GameEventBuffer
    & Collisions
    & FrameState
    & ParticleState & {
    playerId: number,
    playerNextShotTime: number,
    lastSpawnTime: number,
    numEntities: number,
    score: number,
    scoreTimeIncrementer: number,
}

export const GameState = {
    create: (time: number): GameState => {
        const state = {
            ...World.create(),
            ...GameEventBuffer.create(),
            ...Collisions.create(),
            ...FrameState.create(time),
            ...ParticleState.create(),
            playerId: 0,
            lastSpawnTime: time,
            numEntities: 0,
            playerNextShotTime: 0,
            score: 0,
            scoreTimeIncrementer: 0,
        }
        return state
    }
}
