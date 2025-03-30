import { Collisions } from './Collisions'
import { World } from './Entity'
import { FrameState } from './Frame'
import { GameEventBuffer } from './GameEvent'

export type GameState = World
    & GameEventBuffer
    & Collisions
    & FrameState
    & {
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
