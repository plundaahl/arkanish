import { JetParticle } from "../particles";
import { ScriptHandler } from "../../game-state/Script";

const MS_PER_SEC = 1000

export interface JetEmitterData {
    particleTime: number
    distance: number
    lifetime: number
    rate: number
}

export const JetEmitterScriptHandler: ScriptHandler<'JetEmitter', JetEmitterData> = {
    type: "JetEmitter",
    script: {
        type: "JetEmitter",
        onInit(gameState, entity) {
            const data = entity.scriptData as JetEmitterData
            data.particleTime = gameState.gameTime + (Math.random() * (MS_PER_SEC / data.rate))
        },
        onUpdate(gameState, entity) {
            const data = entity.scriptData as JetEmitterData
            if (data.particleTime < gameState.gameTime) {
                data.particleTime = gameState.gameTime + (MS_PER_SEC / data.rate)
                JetParticle.spawn(
                    gameState,
                    entity,
                    Math.PI,
                    data.distance,
                    data.lifetime,
                )
            }
        },
    },
    nullData: {
        particleTime: 0,
        distance: 100,
        lifetime: 500,
        rate: 20,
    },
    serializeData(data: JetEmitterData): Object {
        return { distance: data.distance }
    },
    deserializeData(input: unknown): JetEmitterData | undefined {
        const objInput = typeof input === 'object' ? input as { [key: string]: any } : undefined
        const distance = typeof objInput?.distance === 'number' ? objInput?.distance : undefined
        const lifetime = typeof objInput?.speed === 'number' ? objInput?.speed : undefined
        const rate = typeof objInput?.rate === 'number' ? objInput?.rate : undefined

        if (distance && lifetime && rate) {
            return {
                particleTime: 0,
                distance,
                lifetime,
                rate,
            }
        }
    }
}
