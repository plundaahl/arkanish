import { HighScoreRecord } from './game-state/HighScoreState'
import * as buildInfo from './build-info.json'

const VERSION = 1
const NAME = 'HIGHSCORES'

type HighScoreData = { v: number, records: HighScoreRecord[] }

export const HighScoreDAO = {
    persistScore(score: number) {
        const currentHighScores = loadCurrentHighScores() || {
            v: VERSION,
            records: [],
        }

        const currentHighScoreForVersion = currentHighScores.records.find(
            entry => entry.version === buildInfo.version)

        if (!currentHighScoreForVersion) {
            currentHighScores.records.unshift({
                date: Date.now(),
                version: buildInfo.version,
                score: score,
            })
        } else if (currentHighScoreForVersion.score < score) {
            currentHighScoreForVersion.date = Date.now()
            currentHighScoreForVersion.score = score
        }

        currentHighScores.records.sort()

        window.localStorage.setItem(NAME, JSON.stringify(currentHighScores))
    },
    loadHighScores() {
        return loadCurrentHighScores()?.records || []
    },
}

function loadCurrentHighScores() {
    const current = window.localStorage.getItem(NAME)
    if (current === null || current === undefined) {
        return
    }

    try {
        const result = JSON.parse(current)
        if (typeof result === 'object'
            && typeof (result as any).v === 'number'
            && Array.isArray((result as any).records)
            && ((result as any).records as any[]).every(record => typeof record === 'object'
                && typeof record.date === 'number'
                && typeof record.version === 'string'
                && typeof record.score === 'number'
            )
        ) {
            return result as HighScoreData
        } else {
            console.warn('Could not parse result')
        }
    } catch (err) {
        console.warn(`Invalid content found in localStorage key [${NAME}]: [${current}].  Cannot parse high score data.`)
        return
    }
}