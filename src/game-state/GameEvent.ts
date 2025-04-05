export const GameEventType = {
    NULL: 0,
    COLLISION: 1,
    BOUNCE: 2,
}

type NullGameEvent = {
    type: typeof GameEventType.NULL,
    entity: number,
}
type CollisionGameEvent = {
    type: typeof GameEventType.COLLISION,
    entity: number,
    hitBy: number,
}
type BounceGameEvent = {
    type: typeof GameEventType.BOUNCE,
    entity: number,
}

export type GameEvent = NullGameEvent
    | CollisionGameEvent
    | BounceGameEvent

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
}
