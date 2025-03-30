import { Particle, ParticleState, ParticleTypes } from "../game-state/Particles";
import { GameState } from "../game-state/GameState";
import { RenderCommandBuffer } from "../RenderCommand";
import { renderBox, } from "./RenderSystem";

const particleTypeRenderFunctionMap: { [key: number]: undefined | ((renderBuffer: RenderCommandBuffer, particle: Particle, time: number) => void) } = {
    [ParticleTypes.JET]: renderJetParticle,
    [ParticleTypes.EXPLOSION_RED]: renderExplosionRedParticle,
    [ParticleTypes.EXPLOSION_WHITE]: renderExplosionWhiteParticle,
}

export const ParticleSystem = {
    render: (state: GameState, renderBuffer: RenderCommandBuffer) => {
        // Clean up particles
        for (let i = state.liveParticles.length; i >= 0; i--) {
            const particle = state.liveParticles[i]
            if (particle && state.time > particle.endTime) {
                ParticleState.releaseParticle(state, i)
            }
        }

        // Render
        for (const particle of state.liveParticles) {
            const renderFn = particleTypeRenderFunctionMap[particle.type]
            if (renderFn) {
                renderFn(renderBuffer, particle, state.time)
            }
        }
    },
}

function scaleOffset(from: number, offset: number, by: number): number {
    return from + (offset * by)
}

function renderJetParticle(renderBuffer: RenderCommandBuffer, particle: Particle, time: number) {
    const length = particle.endTime - particle.startTime
    if (length === 0) {
        return
    }
    const pos = (time - particle.startTime) / length

    const size = scaleOffset(10, -8, pos)
    const halfSize = size * 0.5

    RenderCommandBuffer.addCustomRenderCmd(
        renderBuffer,
        particle.originZ,
        renderBox,
        '#666',
        false,
        scaleOffset(particle.originX, particle.vecX, pos) - halfSize,
        scaleOffset(particle.originY, particle.vecY, pos) - halfSize,
        size,
        size,
    )
}

function renderExplosionRedParticle(renderBuffer: RenderCommandBuffer, particle: Particle, time: number) {
    const length = particle.endTime - particle.startTime
    if (length === 0) {
        return
    }
    const pos = (time - particle.startTime) / length

    const size = scaleOffset(10, -8, pos)
    const halfSize = size * 0.5

    RenderCommandBuffer.addCustomRenderCmd(
        renderBuffer,
        particle.originZ,
        renderBox,
        'red',
        false,
        scaleOffset(particle.originX, particle.vecX, pos) - halfSize,
        scaleOffset(particle.originY, particle.vecY, pos) - halfSize,
        size,
        size,
    )
}

function renderExplosionWhiteParticle(renderBuffer: RenderCommandBuffer, particle: Particle, time: number) {
    const length = particle.endTime - particle.startTime
    if (length === 0) {
        return
    }
    const pos = (time - particle.startTime) / length

    const size = scaleOffset(10, -8, pos)
    const halfSize = size * 0.5

    RenderCommandBuffer.addCustomRenderCmd(
        renderBuffer,
        particle.originZ,
        renderBox,
        'white',
        false,
        scaleOffset(particle.originX, particle.vecX, pos) - halfSize,
        scaleOffset(particle.originY, particle.vecY, pos) - halfSize,
        size,
        size,
    )
}