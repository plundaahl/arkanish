
export type HighScoreRecord = { date: number, version: string, score: number }
export type HighScoreState = {
    highScores: HighScoreRecord[],
}

export const HighScoreState = {
    create(): HighScoreState {
        return { highScores: [] }
    }
}
