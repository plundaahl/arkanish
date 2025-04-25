import { World } from "../../game-state/Entity";
import { ScriptHandler } from "../../game-state/Script";

const MS_PER_SCORE_TICK = 800

interface ScriptIncrementerData {
    lastScoreIncrement: number
}

export const ScoreIncrementerScriptHandler: ScriptHandler<'ScoreIncrementer', ScriptIncrementerData> = {
    type: "ScoreIncrementer",
    script: {
        type: "ScoreIncrementer",
        onInit(gameState, entity) {
            (entity.scriptData as ScriptIncrementerData).lastScoreIncrement = gameState.gameTime
        },
        onUpdate(gameState, entity) {
            const player = World.getEntity(gameState, gameState.playerId)
            if (!player || player.hp <= 0) {
                return
            }
            const data = (entity.scriptData as ScriptIncrementerData)
            if (gameState.gameTime > data.lastScoreIncrement + MS_PER_SCORE_TICK) {
                data.lastScoreIncrement = gameState.gameTime
                gameState.score += 1
            }
        },
    },
    nullData: {
        lastScoreIncrement: 0,
    },
    serializeData: function (): Object {
        return {}
    },
    deserializeData: function (input: unknown): ScriptIncrementerData | undefined {
        return typeof input === 'object' ? { lastScoreIncrement: 0 } : undefined
    }
}
