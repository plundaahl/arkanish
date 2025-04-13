import { RenderCommandBuffer } from "../RenderCommand"
import { Entity } from "./Entity"

export const ParticleTypes = Object.freeze({
    NULL: 0,
    JET: 1,
    EXPLOSION_RED: 2,
    EXPLOSION_WHITE: 3,
    TELEGRAPH_CIRCLE: 4,
    BLAST_CIRCLE: 5,
    TELEGRAPH_BEAM: 6,
    BLAST_BEAM: 7,
})

export type Particle = {
    type: string,
    variation: number,
    attachedToEntity: number,
    originX: number,
    originY: number,
    originZ: number,
    vecX: number,
    vecY: number,
    vecZ: number,
    startTime: number,
    endTime: number,
}

const NULL_PARTICLE: Particle = Object.freeze({
    type: '',
    variation: 0,
    attachedToEntity: 0,
    originX: 0,
    originY: 0,
    originZ: 0,
    vecX: 0,
    vecY: 0,
    vecZ: 0,
    startTime: 0,
    endTime: 0,
})

export interface ParticleHandler {
    id: string
    render(renderBuffer: RenderCommandBuffer, particle: Particle, time: number, entity?: Entity): void
    spawn?(state: ParticleState, ...args: any[]): Particle
}

const particleHandlerRegistry: { [Name in string]: ParticleHandler } = {}

export const ParticleHandlerRegistry = {
    registerParticleHandlers: (...handlers: ParticleHandler[]) => {
        for (const handler of handlers) {
            const existingHandler = particleHandlerRegistry[handler.id]
            if (Object.is(handler, existingHandler)) {
                console.warn(`Re-registering ParticleHandlers with id [${handler.id}].  This is probably a coding error.`)
            } else if (existingHandler !== undefined) {
                throw new Error(`Tried to register multiple ParticleHandlers with id [${handler.id}].`)
            }
            particleHandlerRegistry[handler.id] = handler
        }
    },
}

export const Particle = {
    create: (): Particle => Object.assign({}, NULL_PARTICLE),
    reset: (particle: Particle) => { Object.assign(particle, NULL_PARTICLE) },
    getHandlerForId: (id: string): ParticleHandler | undefined => particleHandlerRegistry[id],
}

export type ParticleState = {
    liveParticles: Particle[],
    deadParticles: Particle[],
}

export const ParticleState = {
    create: (): ParticleState => ({ liveParticles: [], deadParticles: [] }),
    provisionParticle: (state: ParticleState, time: number): Particle => {
        const particle = state.deadParticles.pop() || Particle.create()
        particle.startTime = time
        state.liveParticles.push(particle)
        return particle
    },
    releaseParticle: (state: ParticleState, idx: number) => {
        const part = state.liveParticles[idx]

        state.liveParticles[idx] = state.liveParticles[state.liveParticles.length - 1]
        state.liveParticles.pop()

        Particle.reset(part)
        state.deadParticles.push(part)
    },
}
