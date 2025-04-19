export const GameEventType = {
    NULL: 0,
    COLLISION: 1,
    BOUNCE: 2,
    DAMAGE: 3,
}

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
}

export type GameEvent = NullGameEvent
    | CollisionGameEvent
    | BounceGameEvent
    | DamageGameEvent

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
    isCollisionEvent: (event: GameEvent): event is CollisionGameEvent => event.type === GameEventType.COLLISION,
    isBounceEvent: (event: GameEvent): event is BounceGameEvent => event.type === GameEventType.BOUNCE,
    isDamageEvent: (event: GameEvent): event is DamageGameEvent => event.type === GameEventType.DAMAGE,
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
    buffer.publishedEvents.push(event)
    return event
}

export const GameEventBuffer = {
    create: (): GameEventBuffer => ({ publishedEvents: [], pendingEvents: [] }),
    addCollisionEvent: (buffer: GameEventBuffer, entity: number, hitBy: number) => {
        const event = provisionEvent(buffer) as CollisionGameEvent
        event.type = GameEventType.COLLISION
        event.entity = entity
        event.hitBy = hitBy
        return event
    },
    addBounceEvent: (buffer: GameEventBuffer, entity: number) => {
        const event = provisionEvent(buffer) as CollisionGameEvent
        event.type = GameEventType.BOUNCE
        event.entity = entity
        return event
    },
    addDamageEvent: (buffer: GameEventBuffer, entity: number) => {
        const event = provisionEvent(buffer) as CollisionGameEvent
        event.type = GameEventType.DAMAGE
        event.entity = entity
        return event
    },
}
