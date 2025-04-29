import { DataViewCursor } from './DataViewCursor'
import { ObjectSerializer } from './ObjectSerializer'
import { PrimitiveSerializer } from './PrimitiveSerializers'
import { TaggedSerializer } from './TaggedSerializer'
import { TranslationMap } from './TranslationMap'
import { UnionSerializer } from './UnionSerializer'

const translationMap = new TranslationMap()

let buffer: ArrayBuffer
let cursor: DataViewCursor

beforeEach(() => {
    buffer = new ArrayBuffer(256)
    cursor = new DataViewCursor(new DataView(buffer))
})

test('Basic', () => {
    type Vector2 = { type: 'vector2', x: number, y: number }
    const isVector2 = (obj: unknown): obj is Vector2 => typeof obj === 'object' && (obj as Vector2).type === 'vector2'
    const nullVector2: Vector2 = { type: 'vector2', x: 0, y: 0 }
    const vector2 = TaggedSerializer.create('taggedVector2', 1)
        .initialVersion(ObjectSerializer.builder('vector2')
            .addField('x', PrimitiveSerializer.float32)
            .addField('y', PrimitiveSerializer.float32)
            .build<Vector2>(nullVector2, isVector2))

    type Aabb = { type: 'aabb', position: Vector2, bounds: Vector2 }
    const isAabb = (obj: unknown): obj is Aabb => typeof obj === 'object' && (obj as Aabb).type === 'aabb'
    const aabb = TaggedSerializer.create('taggedAabb', 2)
        .initialVersion(ObjectSerializer.builder('aabb')
            .addField('position', vector2)
            .addField('bounds', vector2)
            .build<Aabb>({
                type: 'aabb',
                position: nullVector2,
                bounds: nullVector2,
            }, isAabb))

    type Circle = { type: 'circle', position: Vector2, radius: number }
    const isCircle = (obj: unknown): obj is Circle => typeof obj === 'object' && (obj as Circle).type === 'circle'
    const circle = TaggedSerializer.create('taggedCircle', 3)
        .initialVersion(ObjectSerializer.builder('circle')
            .addField('position', vector2)
            .addField('radius', PrimitiveSerializer.float32)
            .build<Circle>({
                type: 'circle',
                position: nullVector2,
                radius: 0,
            }, isCircle))
    
    const geometry = UnionSerializer.create('geometry')
        .withMember(vector2, isVector2)
        .withMember(circle, isCircle)
        .withMember(aabb, isAabb)
    
    circle.serialize(cursor, {
        type: 'circle',
        position: {
            type: 'vector2',
            x: 37,
            y: 4,
        },
        radius: 12,
    })
    const circleOffset = cursor.offset

    aabb.serialize(cursor, {
        type: 'aabb',
        position: { type: 'vector2', x: 4, y: 9 },
        bounds: { type: 'vector2', x: 22, y: 7 }
    })
    const aabbOffset = cursor.offset

    cursor.reset()

    {
        const result = geometry.deserialize(cursor, translationMap) as Circle
        expect(cursor.offset).toEqual(circleOffset)
        expect(result.type).toEqual('circle')
        expect(result.position.x).toEqual(37)
        expect(result.position.y).toEqual(4)
        expect(result.radius).toEqual(12)
    }

    {
        const result = geometry.deserialize(cursor, translationMap) as Aabb
        expect(cursor.offset).toEqual(aabbOffset)
        expect(result.type).toEqual('aabb')
        expect(result.position.x).toEqual(4)
        expect(result.position.y).toEqual(9)
        expect(result.bounds.x).toEqual(22)
        expect(result.bounds.y).toEqual(7)
    }
})
