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
    USE_INTERNAL_VELOCITY: entityFlag(),
    PROPAGATE_DEATH_TO_PARENT: entityFlag(),
    IN_PLAY_AREA: entityFlag(),
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
    readonly parent: number
    hurtBy: bigint
    defaultSpawner: string
    // Internal velocity (relative to local position and facing - allows for steering)
    velAI: number
    velMI: number
    // Local position and velocity (relative to parent)
    posXL: number
    posYL: number
    posZL: number
    posRL: number
    velXL: number
    velYL: number
    velRL: number
    // Global position (relative to global coordinate space)
    posXG: number
    posYG: number
    posZG: number
    posRG: number
    colliderBbSrc: BoundingBox[],
    colliderBbTransform: BoundingBox[],
    radius: number
    collidesWith: bigint,
    invulnerableUntil: number,
    colour: string,
    hp: number,
    scoreValue: number,
    script: Script<string, Object> | undefined
    scriptData: Object | undefined
}

type Writeable<T> = { -readonly [P in keyof T]: T[P] }

type InternalEntity = Writeable<Entity>

const NULL_ENTITY: Omit<Entity, 'id' | 'colliderBbSrc' | 'colliderBbTransform'> = Object.freeze({
    state: EntityStates.FREE,
    flags: 0n,
    parent: 0,
    hurtBy: 0n,
    defaultSpawner: '',
    velAI: 0,
    velMI: 0,
    posXL: 0,
    posYL: 0,
    posZL: 0,
    posRL: 0,
    velXL: 0,
    velYL: 0,
    velRL: 0,
    posXG: 0,
    posYG: 0,
    posZG: 0,
    posRG: 0,
    collidesWith: 0n,
    radius: 0,
    invulnerableUntil: 0,
    colour: '',
    hp: 0,
    scoreValue: 0,
    script: undefined,
    scriptData: undefined,
})

const excludedKeys = [
    'id',
    'parent',
    'state',
    'flags',
    'hurtBy',
    'posXG',
    'posYG',
    'posZG',
    'posRG',
    'radius',
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
        posXL: 0,
        posYL: 0,
        posZL: 0,
        posRL: 0,
        velAI: 0,
        velMI: 0,
        velXL: 0,
        velYL: 0,
        velRL: 0,
        colliderBbSrc: 0,
        colour: 0,
        defaultSpawner: 0,
        hp: 0,
        scoreValue: 0,
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
                case 'posXL':
                case 'posYL':
                case 'posZL':
                case 'posRL':
                case 'velAI':
                case 'velMI':
                case 'velXL':
                case 'velYL':
                case 'velRL':
                case 'hp': if (spec[key] !== undefined) { entity[key] = spec[key] }; break;
                case 'defaultSpawner':
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
                case 'posXL':
                case 'posYL':
                case 'posZL':
                case 'posRL':
                case 'velAI':
                case 'velMI':
                case 'velXL':
                case 'velYL':
                case 'velRL':
                case 'hp': spec[key] = entity[key]; break;
                case 'defaultSpawner':
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
    noFreeEntitiesBefore: number
}
export const World = {
    create: (size: number = DEFAULT_NUM_ENTITIES): World => {
        const entities: Entity[] = new Array(size)

        for (let i = 0; i < size; i++) {
            entities[i] = Entity.create(i)
        }

        return {
            entities,
            noFreeEntitiesBefore: -1,
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
    spawnEntity: (world: World, parent: number = 0): Entity => {
        const parentIndex = Id.indexOf(parent)
        let entity: Entity | undefined = undefined
        let idx: number = -1
        
        if (world.noFreeEntitiesBefore < world.entities.length - 1) {
            const startAt = parentIndex === 0 ? world.noFreeEntitiesBefore : parentIndex

            for (let i = startAt; i < world.entities.length; i++) {
                if (world.entities[i]?.state === EntityStates.FREE) {
                    idx = i
                    entity = world.entities[i]
                    break
                }
            }
        }

        if (entity === undefined) {
            idx = world.entities.length
            entity = Entity.create(idx)
            world.entities[idx] = entity
        }

        if (!parentIndex || parentIndex < world.noFreeEntitiesBefore) {
            world.noFreeEntitiesBefore = idx
        }

        entity.state = EntityStates.SPAWNING
        if (parent) {
            (entity as InternalEntity).parent = parent
        }
        return entity
    },
    releaseEntity: (world: World, entity: number | Entity): void => {
        const id = typeof entity === 'number' ? entity : entity.id
        const ent = typeof entity === 'number' ? World.getEntity(world, entity) : entity
        const idx = Id.indexOf(id)
        if (ent === undefined || ent.state === EntityStates.FREE) {
            return
        }
        world.noFreeEntitiesBefore = Math.min(world.noFreeEntitiesBefore, idx)
        Entity.release(ent)
    },
}
