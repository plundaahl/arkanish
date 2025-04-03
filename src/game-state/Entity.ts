import { BoundingBox } from './BoundingBox'
import { Id } from './Id'
import { Flag } from './Flag'

const entityFlag = Flag.makeBigintFlagFactory()
export const EntityFlags = Object.freeze({
    COLLIDER: entityFlag(),
    SCRIPT: entityFlag(),
    ROLE_PLAYER: entityFlag(),
    ROLE_PLAYER_BULLET: entityFlag(),
    ROLE_ENEMY: entityFlag(),
    ROLE_PICKUP: entityFlag(),
    parse: (flags: string[] | undefined): bigint => {
        if (!flags) {
            return 0n
        }
        let bitfield = 0n
        for (const flag of flags) {
            const flagValue = (EntityFlags as any)[flag]
            if (typeof flagValue !== 'bigint') {
                throw new Error(`Invalid flag [${flag}].`)
            }
            bitfield |= flagValue
        }
        return bitfield
    },
})

export const EntityStates = Object.freeze({
    FREE: 0,
    SPAWNING: 1,
    ALIVE: 2,
    DYING: 3,
})

const colliderFlag = Flag.makeNumberFlagFactory()
export const ColliderFlags = Object.freeze({
    PLAYER: colliderFlag(),
    ENEMY: colliderFlag(),
    POWERUP: colliderFlag(),
    PLAYER_BULLET: colliderFlag(),
})

export interface Entity {
    id: number
    state: number
    flags: bigint
    posX: number
    posY: number
    posZ: number
    velX: number
    velY: number
    colliderBbSrc: BoundingBox[],
    colliderBbTransform: BoundingBox[],
    colliderGroup: number,
    collidesWith: number,
    invulnerableUntil: number,
    colour: string,
    script: string,
    scriptState: number,
    scriptTimeEnteredState: number,
    hp: number,
}

export type EntitySpec = Omit<Entity, 'id'>

export const NULL_ENTITY_SPEC: EntitySpec = Object.freeze({
    state: EntityStates.FREE,
    flags: 0n,
    posX: 0,
    posY: 0,
    posZ: 0,
    velX: 0,
    velY: 0,
    colliderBbSrc: [],
    colliderBbTransform: [],
    colliderGroup: 0,
    collidesWith: 0,
    invulnerableUntil: 0,
    colour: '',
    script: '',
    scriptState: 0,
    scriptTimeEnteredState: 0,
    hp: 0,
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
    killEntity: (entity: Entity) => {
        entity.state = EntityStates.DYING
    },
}

export type EntityTemplate = Partial<Omit<Entity,
    'id'
    | 'state'
    | 'flags'
    | 'colliderBbTransfrom'
    | 'invulnerableUntil'
    | 'scriptState'
    | 'scriptTimeEnteredState'
> & { flags: string[] }>

export const EntityTemplate = {
    is: (obj: unknown): obj is EntityTemplate => {
        if (typeof obj !== 'object' || obj === null) {
            return false
        }
        const objAny = obj as any
        return (
            (Array.isArray(objAny['flags']) || objAny['flags'] === undefined)
            && (typeof objAny['posX'] === 'number' || objAny['posX'] === undefined)
            && (typeof objAny['posY'] === 'number' || objAny['posY'] === undefined)
            && (typeof objAny['posZ'] === 'number' || objAny['posZ'] === undefined)
            && (typeof objAny['velX'] === 'number' || objAny['velX'] === undefined)
            && (typeof objAny['velY'] === 'number' || objAny['velY'] === undefined)
            && (Array.isArray(objAny['colliderBbSrc']) || objAny['colliderBbSrc'] === undefined)
            && (typeof objAny['colliderGroup'] === 'number' || objAny['colliderGroup'] === undefined)
            && (typeof objAny['collidesWith'] === 'number' || objAny['collidesWith'] === undefined)
            && (typeof objAny['colour'] === 'string' || objAny['colour'] === undefined)
            && (typeof objAny['script'] === 'string' || objAny['script'] === undefined)
            && (typeof objAny['hp'] === 'number' || objAny['hp'] === undefined)
        )
    },
    toEntitySpec: (template: EntityTemplate): EntitySpec => {
        const spec = Object.assign({}, NULL_ENTITY_SPEC)
        const { flags, ...rest } = template
        Object.assign(spec, rest)
        spec.flags = EntityFlags.parse(flags)
        return spec
    },
}

const DEFAULT_NUM_ENTITIES = 512
export interface World {
    entities: Entity[]
    freeList: number[]
}
export const World = {
    create: (size: number = DEFAULT_NUM_ENTITIES): World => {
        const entities: Entity[] = new Array(size)
        const freeList: number[] = new Array(size)

        for (let i = 0; i < size; i++) {
            entities[i] = Entity.create(i)
            freeList[i] = size - i - 1
        }

        return {
            entities,
            freeList,
        }
    },
    reset: (world: World) => {
        for (const entity of world.entities) {
            World.releaseEntity(world, entity)
        }
    },
    getEntity: (world: World, id: number): Entity | undefined => {
        const idx = Id.indexOf(id)
        if (idx >= world.entities.length) {
            throw new Error(`Entity index [${idx}] is out-of-bounds.  World only contains [${world.entities.length}] entities.`)
        }
        const entity = world.entities[idx]
        if (entity.id === id
            && (entity.state === EntityStates.ALIVE
                || entity.state === EntityStates.DYING
            )
        ) {
            return entity
        }
        return undefined
    },
    spawnEntity: (world: World, spec?: EntitySpec): Entity => {
        let idx = world.freeList.pop()
        let entity: Entity
        if (idx === undefined) {
            idx = world.entities.length
            entity = Entity.create(idx, spec)
            world.entities[idx] = entity
        } else {
            entity = world.entities[idx]
        }
        entity.state = EntityStates.SPAWNING
        return entity
    },
    releaseEntity: (world: World, entity: number | Entity): void => {
        const id = typeof entity === 'number' ? entity : entity.id
        const ent = typeof entity === 'number' ? World.getEntity(world, entity) : entity
        const idx = Id.indexOf(id)
        if (ent === undefined || world.freeList.includes(idx)) {
            return
        }
        world.freeList.push(idx)
        Entity.release(ent)
    },
}
