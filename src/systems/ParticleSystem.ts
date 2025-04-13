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
    [ParticleTypes.TELEGRAPH_BEAM]: renderTelegraphBeamParticle,
    [ParticleTypes.BLAST_BEAM]: renderBlastBeamParticle,
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
                particle.originX + (entity?.transX || 0),
                particle.vecX + (entity?.transX || 0),
                pos
            ) - halfSize,
            scaleOffset(
                particle.originY + (entity?.transY || 0),
                particle.vecY + (entity?.transY || 0),
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
        x += entity.transX
        y += entity.transY
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
        particle.originX + (entity?.transX || 0),
        particle.originY + (entity?.transY || 0),
        size,
        opacity,
    )
}

const BEAM_LENGTH = 4000
function renderTelegraphBeamParticle(renderBuffer: RenderCommandBuffer, particle: Particle, time: number, entity?: Entity) {
    const length = particle.endTime - particle.startTime
    if (length === 0) {
        return
    }

    const animationPos = (time - particle.startTime) / length
    const opacity = Math.pow(animationPos, 2)
    const w = animationPos * particle.variation
    const r = Math.atan2(particle.vecY, particle.vecX)

    RenderCommandBuffer.addCustomRenderCmd(
        renderBuffer,
        particle.originZ + (entity?.posZ || 0),
        renderBeam,
        '#600',
        true,
        opacity,
        particle.originX + (entity?.transX || 0),
        particle.originY + (entity?.transY || 0),
        w,
        BEAM_LENGTH,
        r + (entity?.transR || 0),
    )
}

function renderBlastBeamParticle(renderBuffer: RenderCommandBuffer, particle: Particle, time: number, entity?: Entity) {
    const length = particle.endTime - particle.startTime
    if (length === 0) {
        return
    }

    const animationPos = (time - particle.startTime) / length
    const opacity = 1 - Math.pow(animationPos, 2)
    const w = particle.variation
    const r = Math.atan2(particle.vecY, particle.vecX)

    RenderCommandBuffer.addCustomRenderCmd(
        renderBuffer,
        particle.originZ + (entity?.posZ || 0),
        renderBeam,
        'white',
        true,
        opacity,
        particle.originX + (entity?.transX || 0),
        particle.originY + (entity?.transY || 0),
        w,
        BEAM_LENGTH,
        r + (entity?.transR || 0),
    )
}

function renderBeam(
    ctx: CanvasRenderingContext2D, style: string, fill: boolean,
    opacity: number, x: number, y: number, w: number, l: number, r: number
) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(r)

    const halfWidth = w * 0.5

    ctx.globalAlpha = opacity
    if (fill) {
        ctx.fillStyle = style
        ctx.fillRect(0, 0 - halfWidth, l, w)
    } else {
        ctx.strokeStyle = style
        ctx.lineWidth = 2
        ctx.strokeRect(0, 0 - halfWidth, l, w)
    }
    ctx.restore()
}
