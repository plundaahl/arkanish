import { GameState } from "../../game-state/GameState";
import { Particle, ParticleHandler, ParticleState } from "../../game-state/Particles";
import { Vector2 } from "../../game-state/Vector";
import { ExtraMath } from "../../Math";
import { createBoxParticleRenderFn } from "./util";

const dirVec: Vector2 = Vector2.createFromCoordinates(1, 0)

const BASE_SPREAD = 0.3
const PERCENT_BURSTS = 0.2
const CLOUD_SPREAD = 0.7
const MIN_LIFETIME_SCALE = 0.05

export const LaunchParticle = {
    id: "LaunchParticle",
    spawn(
        state: GameState,
        x: number,
        y: number,
        z: number,
        angle: number,
        range: number,
        lifetime: number,
    ): Particle {
        const particle = ParticleState.provisionParticle(state, state.time)
        particle.type = LaunchParticle.id
        particle.originX = x
        particle.originY = y
        particle.originZ = z

        const lifetimeScale = ExtraMath.rollBetween(MIN_LIFETIME_SCALE, 1)
        const actualLifetime = lifetime * lifetimeScale
        particle.endTime = state.time + actualLifetime

        const veer = Math.random()

        const rangeVariation = Math.pow(ExtraMath.rollBetween(0.5, 1), 4)
        const rangeScale = Math.pow(Math.sin(1 - veer * 1.5), 2)
        const minRange = range * BASE_SPREAD * rangeVariation

        const actualAngle = angle + (ExtraMath.positiveOrNegative() * veer * Math.PI * 0.4)
        const actualRange = (((range - minRange) * rangeScale) + minRange) * ExtraMath.rollBetween(0.8, 1)

        Vector2.setToAngleAndMag(dirVec, actualAngle, actualRange)

        particle.vecX = Vector2.xOf(dirVec)
        particle.vecY = Vector2.yOf(dirVec)

        return particle
    },
    render: createBoxParticleRenderFn('#555'),
}

const assertion: ParticleHandler = LaunchParticle