import { BoundingBox } from './BoundingBox'
import { Id } from './Id'
import { Flag } from './Flag'

const entityFlag = Flag.makeBigintFlagFactory()
export const EntityFlags = Object.freeze({
    ALIVE: entityFlag(),
    DYING: entityFlag(),
    COLLIDER: entityFlag(),
    ROLE_PLAYER: entityFlag(),
    ROLE_PLAYER_BULLET: entityFlag(),
    ROLE_ENEMY: entityFlag(),
    ROLE_POWERUP: entityFlag(),
})

const colliderFlag = Flag.makeNumberFlagFactory()
export const ColliderFlag = Object.freeze({
    PLAYER: colliderFlag(),
    ENEMY: colliderFlag(),
    POWERUP: colliderFlag(),
    PLAYER_BULLET: colliderFlag(),
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
    colour: string,
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
    colour: '',
})

export const Entity = {
    create: (idx: number, spec?: EntitySpec): Entity => {
        const entity = Object.assign({ id: Id.init(idx) }, NULL_ENTITY_SPEC)
        if (spec) {
            Entity.populate(entity, spec)
        }
        return entity
    },
    populate: (entity: Entity, spec: EntitySpec) => Object.assign(entity, spec), 
    release: (entity: Entity) => {
        Object.assign(entity, NULL_ENTITY_SPEC)
        entity.id = Id.incrementGen(entity.id)
    },
}