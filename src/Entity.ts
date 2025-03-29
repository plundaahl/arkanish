import { BoundingBox } from './BoundingBox'
import { Id } from './Id'

const makeFlagFactory = () => {
    let next = 1n
    return (): bigint => {
        let current = next
        next = next << 1n
        return current
    }
}

const entityFlag = makeFlagFactory()

export const EntityFlags = Object.freeze({
    ALIVE: entityFlag(),
    COLLIDER: entityFlag(),
})

export interface Entity {
    id: number
    flags: bigint
    posX: number
    posY: number
    velX: number
    velY: number
    colliderBbSrc: BoundingBox[],
    colliderBbTransform: BoundingBox[],
    colliderGroup: number,
    collidesWith: number,
    invulnerableUntil: number,
}

export type EntitySpec = Omit<Entity, 'id'>

const NULL_ENTITY_SPEC: EntitySpec = Object.freeze({
    flags: 0n,
    posX: 0,
    posY: 0,
    velX: 0,
    velY: 0,
    colliderBbSrc: [],
    colliderBbTransform: [],
    colliderGroup: 0,
    collidesWith: 0,
    invulnerableUntil: 0,
})

export const Entity = {
    create: (idx: number, spec?: EntitySpec): Entity => {
        const entity = Object.assign({ id: Id.init(idx) }, NULL_ENTITY_SPEC)
        if (spec) {
            Entity.populate(entity, spec)
        }
        return entity
    },
    reset: (entity: Entity) => { Object.assign(entity, NULL_ENTITY_SPEC) },
    populate: (entity: Entity, spec: EntitySpec) => Object.assign(entity, spec), 
    release: (entity: Entity) => {
        entity.id = Id.incrementGen(entity.id)
    },
}