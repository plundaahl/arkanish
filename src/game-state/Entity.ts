import { BoundingBox } from './BoundingBox'
import { Id } from './Id'
import { Flag } from './Flag'
import { Script } from './Script'

const entityFlag = Flag.makeBigintFlagFactory()
const entityFlagBitmasksToName = new Map<bigint, string>()
export const EntityFlags = Object.freeze({
    COLLIDER: entityFlag(),
    SCRIPT: entityFlag(),
    CONSTRAIN_TO_PLAY_SPACE: entityFlag(),
    BOUNCE_IN_PLAY_SPACE: entityFlag(),

    ROLE_PLAYER: entityFlag(),
    ROLE_PLAYER_BULLET: entityFlag(),
    ROLE_OBSTACLE: entityFlag(),
    ROLE_ENEMY_BULLET: entityFlag(),
    ROLE_POWERUP: entityFlag(),

    HURT_BY_PLAYER_BULLETS: entityFlag(),
    HURT_BY_OBSTACLE: entityFlag(),

    ROLE_PICKUP: entityFlag(),
    INVULNERABLE: entityFlag(),
    DESTROY_AFTER_SECTION: entityFlag(),
    DESTROY_AT_0_HP: entityFlag(),
    DO_NOT_CLAMP_TO_WIDTH_ON_SPAWN: entityFlag(),
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
    serialize: (flags: bigint) => {
        const flagNames: (Exclude<keyof typeof EntityFlags, 'parse' | 'serialize'>)[] = []
        let mask = 1n
        while (flags > 0n) {
            const flagName = entityFlagBitmasksToName.get(flags & mask)
            if (flagName && EntityFlags[flagName as keyof typeof EntityFlags] !== undefined) {
                flagNames.push(flagName as Exclude<keyof typeof EntityFlags, 'parse' | 'serialize'>)
            }

            flags &= ~mask
            mask = mask << 1n
        }
        return flagNames.length === 0 ? undefined : flagNames
    },
})
{
    const allEntityFlags = Object.entries(EntityFlags)
        .filter(([_, value]) => typeof value === 'bigint') as [string, bigint][]

    for (const [name, bitMask] of allEntityFlags) {
        entityFlagBitmasksToName.set(bitMask, name)
    }
}

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
    parent: number
    hurtBy: bigint
    posX: number
    posY: number
    posZ: number
    posR: number
    velX: number
    velY: number
    velR: number
    transX: number
    transY: number
    transR: number
    colliderBbSrc: BoundingBox[],
    colliderBbTransform: BoundingBox[],
    collidesWith: bigint,
    invulnerableUntil: number,
    colour: string,
    hp: number,
    script: Script<string, Object> | undefined
    scriptData: Object | undefined
}

const NULL_ENTITY: Omit<Entity, 'id' | 'colliderBbSrc' | 'colliderBbTransform'> = Object.freeze({
    state: EntityStates.FREE,
    flags: 0n,
    parent: 0,
    hurtBy: 0n,
    posX: 0,
    posY: 0,
    posZ: 0,
    posR: 0,
    velX: 0,
    velY: 0,
    velR: 0,
    transX: 0,
    transY: 0,
    transR: 0,
    collidesWith: 0n,
    invulnerableUntil: 0,
    colour: '',
    hp: 0,
    script: undefined,
    scriptData: undefined,
})

const excludedKeys = [
    'id',
    'parent',
    'state',
    'flags',
    'hurtBy',
    'transX',
    'transY',
    'transR',
    'colliderBbTransform',
    'invulnerableUntil',
] as const
const assertExcludedKeys: readonly (keyof Entity)[] = excludedKeys

export type EntitySpec = Partial<Omit<Entity, typeof excludedKeys[number]> & {
    flags: Exclude<keyof typeof EntityFlags, 'parse'>[],
    hurtBy: Exclude<keyof typeof EntityFlags, 'parse'>[],
    collidesWith: Exclude<keyof typeof EntityFlags, 'parse'>[],
}>
const entitySpecKeys = (() => {
    const keyObj: { [key in keyof Required<EntitySpec>]: 0 } = {
        posX: 0,
        posY: 0,
        posZ: 0,
        posR: 0,
        velX: 0,
        velY: 0,
        velR: 0,
        colliderBbSrc: 0,
        colour: 0,
        hp: 0,
        flags: 0,
        hurtBy: 0,
        collidesWith: 0,
        script: 0,
        scriptData: 0,
    }
    return Object.keys(keyObj) as (keyof EntitySpec)[]
})()

export const Entity = {
    create: (idx: number): Entity => {
        const entity = Object.assign({ id: Id.init(idx) }, NULL_ENTITY) as Entity
        entity.colliderBbSrc = []
        entity.colliderBbTransform = []
        return entity
    },
    release: (entity: Entity) => {
        Object.assign(entity, NULL_ENTITY)
        entity.colliderBbSrc.length = 0
        entity.colliderBbTransform.length = 0
        entity.id = Id.incrementGen(entity.id)
    },
    killEntity: (entity: Entity) => {
        entity.state = EntityStates.DYING
    },
    populateFromSpec: (entity: Entity, spec: EntitySpec) => {
        const specKeys = Object.keys(spec) as (keyof Required<EntitySpec>)[]
        for (const key of specKeys) {
            switch (key) {
                case 'hurtBy':
                case 'collidesWith':
                case 'flags': entity.flags = EntityFlags.parse(spec.flags); break;
                case 'posX':
                case 'posY':
                case 'posZ':
                case 'posR':
                case 'velX':
                case 'velY':
                case 'velR':
                case 'hp': if (spec[key] !== undefined) { entity[key] = spec[key] }; break;
                case 'colour': if (spec[key] !== undefined) { entity[key] = spec[key] }; break;
                case 'colliderBbSrc': if (spec[key] !== undefined) { entity[key] = spec[key].map(BoundingBox.clone) }; break;
                default:
                    throw new Error(`Invalid key [${key}].`)
            }
        }
    },
    serialize: (entity: Entity): EntitySpec => {
        const spec: EntitySpec = {}
        for (const key of entitySpecKeys) {
            if (entity[key] === (NULL_ENTITY as any)[key]) {
                continue
            }
            switch (key) {
                case 'hurtBy':
                case 'collidesWith':
                case 'flags': spec.flags = EntityFlags.serialize(entity.flags); break
                case 'posX':
                case 'posY':
                case 'posZ':
                case 'posR':
                case 'velX':
                case 'velY':
                case 'velR':
                case 'hp': spec[key] = entity[key]; break;
                case 'colour': spec[key] = entity[key]; break;
                case 'colliderBbSrc': spec[key] = entity[key]; break;
                default:
                    throw new Error(`Invalid key [${key}].`)
            }
        }
        return spec
    },
    deserialize: (obj: unknown): Entity | undefined => {
        throw new Error('Not yet implemented')
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
    spawnEntity: (world: World): Entity => {
        let idx = world.freeList.pop()
        let entity: Entity
        if (idx === undefined) {
            idx = world.entities.length
            entity = Entity.create(idx)
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
