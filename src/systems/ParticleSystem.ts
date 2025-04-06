import { Particle, ParticleState, ParticleTypes } from "../game-state/Particles";
import { GameState } from "../game-state/GameState";
import { RenderCommandBuffer } from "../RenderCommand";
import { renderBox, renderCircle, } from "./RenderSystem";
import { Entity, World } from "../game-state/Entity";

type ParticleRenderFn = (renderBuffer: RenderCommandBuffer, particle: Particle, time: number, entity?: Entity) => void

const particleTypeRenderFunctionMap: { [key: number]: undefined | ParticleRenderFn } = {
    [ParticleTypes.JET]: createBoxParticleRenderFn('#666'),
    [ParticleTypes.EXPLOSION_RED]: createBoxParticleRenderFn('red'),
    [ParticleTypes.EXPLOSION_WHITE]: createBoxParticleRenderFn('white'),
    [ParticleTypes.BLAST_CIRCLE]: renderBlastCircleParticle,
    [ParticleTypes.TELEGRAPH_CIRCLE]: renderTelegraphCircleParticle,
}

export const ParticleSystem = {
    render: (state: GameState, renderBuffer: RenderCommandBuffer) => {
        // Clean up expired particles
        for (let i = state.liveParticles.length; i >= 0; i--) {
            const particle = state.liveParticles[i]
            const particleIsExpired = particle && state.time > particle.endTime
            const particleEntityNoLongerExists = particle && particle.attachedToEntity > 0 && !World.getEntity(state, particle.attachedToEntity)
            if (particleIsExpired || particleEntityNoLongerExists) {
                ParticleState.releaseParticle(state, i)
            }
        }

        // Render
        for (const particle of state.liveParticles) {
            const attachedEntity = particle.attachedToEntity ? World.getEntity(state, particle.attachedToEntity) : undefined
            const renderFn = particleTypeRenderFunctionMap[particle.type]
            if (renderFn) {
                renderFn(renderBuffer, particle, state.time, attachedEntity)
            }
        }
    },
}

function scaleOffset(from: number, offset: number, by: number): number {
    return from + (offset * by)
}

function createBoxParticleRenderFn(colour: string) {
    return function renderExplosionWhiteParticle(renderBuffer: RenderCommandBuffer, particle: Particle, time: number, entity?: Entity) {
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
            colour,
            false,
            scaleOffset(
                particle.originX + (entity?.posX || 0),
                particle.vecX + (entity?.posX || 0),
                pos
            ) - halfSize,
            scaleOffset(
                particle.originY + (entity?.posY || 0),
                particle.vecY + (entity?.posY || 0),
                pos
            ) - halfSize,
            size,
            size,
        )
    }
}

function renderTelegraphCircleParticle(renderBuffer: RenderCommandBuffer, particle: Particle, time: number, entity?: Entity) {
    const length = particle.endTime - particle.startTime
    if (length === 0) {
        return
    }
    const opacity = Math.pow((time - particle.startTime) / length, 2)
    const size = Math.sqrt((particle.vecX * particle.vecX) + (particle.vecY * particle.vecY))
    let x = particle.originX
    let y = particle.originY
    if (entity) {
        x += entity.posX
        y += entity.posY
    }

    RenderCommandBuffer.addCustomRenderCmd(
        renderBuffer,
        particle.originZ + (entity?.posZ || 0),
        renderCircle,
        '#600',
        true,
        x,
        y,
        size,
        opacity,
    )
}

function renderBlastCircleParticle(renderBuffer: RenderCommandBuffer, particle: Particle, time: number, entity?: Entity) {
    const length = particle.endTime - particle.startTime
    if (length === 0) {
        return
    }
    const opacity = Math.pow(1 - ((time - particle.startTime) / length), 2)
    const size = Math.sqrt((particle.vecX * particle.vecX) + (particle.vecY * particle.vecY))

    RenderCommandBuffer.addCustomRenderCmd(
        renderBuffer,
        particle.originZ + (entity?.posZ || 0),
        renderCircle,
        'white',
        true,
        particle.originX + (entity?.posX || 0),
        particle.originY + (entity?.posY || 0),
        size,
        opacity,
    )
}
