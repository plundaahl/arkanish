import { GameState } from "../../game-state/GameState";
import { Entity } from "../../game-state/Entity";
import { Particle, ParticleHandler, ParticleState } from "../../game-state/Particles";
import { createBoxParticleRenderFn } from "./util";
import { Vector2 } from "../../game-state/Vector";
import { ExtraMath } from "../../Math";

const dirVec: Vector2 = Vector2.createFromCoordinates(1, 0)
const DEFAULT_DIR = Math.PI * 0.5
const SPREAD = Math.PI * 0.05

export const JetParticle = {
    id: "JetParticle",
    render: createBoxParticleRenderFn('#444'),
    spawn: (
        state: GameState,
        entity: Entity,
        direction: number = DEFAULT_DIR,
        distance: number = 100,
        time: number = 500,
    ): Particle => {
        const particle = ParticleState.provisionParticle(state, state.gameTime)
        particle.type = JetParticle.id
        particle.originZ = entity.posZG - 1
        particle.originX = entity.posXG
        particle.originY = entity.posYG
        Vector2.setToAngleAndMag(dirVec, entity.posRG + direction, distance)
        Vector2.rotateBy(dirVec, ExtraMath.positiveOrNegative() * Math.random() * SPREAD)
        particle.vecY = Vector2.yOf(dirVec)
        particle.vecX = Vector2.xOf(dirVec)
        particle.endTime = state.gameTime + time
        return particle
    },
}

const assertion: ParticleHandler = JetParticle