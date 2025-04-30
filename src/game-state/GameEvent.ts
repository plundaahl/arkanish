

export const GameEventType = {
    NULL: 0,
    COLLISION: 1,
    BOUNCE: 2,
    DAMAGE: 3,
    SPAWN: 4,
    DEATH: 5,
    CHILD_DEATH: 6,
} as const

type NullGameEvent = {
    type: typeof GameEventType.NULL,
    entity: number,
}
export type CollisionGameEvent = {
    type: typeof GameEventType.COLLISION,
    entity: number,
    hitBy: number,
}
export type BounceGameEvent = {
    type: typeof GameEventType.BOUNCE,
    entity: number,
}
export type DamageGameEvent = {
    type: typeof GameEventType.DAMAGE,
    entity: number,
    dead: boolean,
}
export type SpawnGameEvent = {
    type: typeof GameEventType.SPAWN,
    entity: number,
    intensity: number,
}
export type DespawnGameEvent = {
    type: typeof GameEventType.DEATH,
    entity: number,
    intensity: number,
}
export type ChildDeathEvent = {
    type: typeof GameEventType.CHILD_DEATH,
    entity: number,
    child: number,
}

export type GameEvent = NullGameEvent
    | CollisionGameEvent
    | BounceGameEvent
    | DamageGameEvent
    | SpawnGameEvent
    | DespawnGameEvent
    | ChildDeathEvent

function reset(obj: Object): any {
    for (const prop of Object.getOwnPropertyNames(obj)) {
        delete (obj as any)[prop]
    }
    return obj
}

export const GameEvent = {
    create: (): GameEvent => ({ type: GameEventType.NULL, entity: 0 }),
    releaseEvent: (event: GameEvent): NullGameEvent => {
        const cleared = reset(event) as NullGameEvent
        cleared.type = GameEventType.NULL
        return cleared
    },
    isNullEvent: (event: GameEvent): event is NullGameEvent => event.type === GameEventType.NULL,
    isCollisionEvent: (event: GameEvent): event is CollisionGameEvent => event.type === GameEventType.COLLISION,
    isBounceEvent: (event: GameEvent): event is BounceGameEvent => event.type === GameEventType.BOUNCE,
    isDamageEvent: (event: GameEvent): event is DamageGameEvent => event.type === GameEventType.DAMAGE,
    isSpawnEvent: (event: GameEvent): event is SpawnGameEvent => event.type === GameEventType.SPAWN,
    isDeathEvent: (event: GameEvent): event is DespawnGameEvent => event.type === GameEventType.DEATH,
    isChildDeathEvent: (event: GameEvent): event is ChildDeathEvent => event.type === GameEventType.CHILD_DEATH,
}

export type GameEventBuffer = {
    publishedEvents: GameEvent[]
    pendingEvents: GameEvent[]
}

const provisionEvent = (buffer: GameEventBuffer): GameEvent => {
    for (const event of buffer.pendingEvents) {
        if (event.type === GameEventType.NULL) {
            return event
        }
    }
    const event = GameEvent.create()
    buffer.pendingEvents.push(event)
    return event
}

export const GameEventBuffer = {
    create: (): GameEventBuffer => ({ publishedEvents: [], pendingEvents: [] }),
    reset(buffer: GameEventBuffer): void {
        for (const event of buffer.pendingEvents) {
            GameEvent.releaseEvent(event)
        }
    },
    addCollisionEvent: (buffer: GameEventBuffer, entity: number, hitBy: number) => {
        const event = provisionEvent(buffer) as CollisionGameEvent
        event.type = GameEventType.COLLISION
        event.entity = entity
        event.hitBy = hitBy
        return event
    },
    addBounceEvent: (buffer: GameEventBuffer, entity: number) => {
        const event = provisionEvent(buffer) as BounceGameEvent
        event.type = GameEventType.BOUNCE
        event.entity = entity
        return event
    },
    addDamageEvent: (buffer: GameEventBuffer, entity: number, dead: boolean = false) => {
        const event = provisionEvent(buffer) as DamageGameEvent
        event.type = GameEventType.DAMAGE
        event.entity = entity
        event.dead = dead
        return event
    },
    addSpawnEvent: (buffer: GameEventBuffer, entity: number, intensity: number) => {
        const event = provisionEvent(buffer) as SpawnGameEvent
        event.type = GameEventType.SPAWN
        event.entity = entity
        event.intensity = intensity
        return event
    },
    addDeathEvent: (buffer: GameEventBuffer, entity: number, intensity: number) => {
        const event = provisionEvent(buffer) as DespawnGameEvent
        event.type = GameEventType.DEATH
        event.entity = entity
        event.intensity = intensity
        return event
    },
    addChildDeathEvent: (buffer: GameEventBuffer, entity: number, child: number) => {
        const event = provisionEvent(buffer) as ChildDeathEvent
        event.type = GameEventType.CHILD_DEATH
        event.entity = entity
        event.child = child
        return event
    },
}
