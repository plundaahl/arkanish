import { DataViewCursor } from './DataViewCursor'
import { PrimitiveSerializer } from './PrimitiveSerializers'
import { TaggedSerializer } from './TaggedSerializer'
import { TranslationMap } from './TranslationMap'

const translationMap = new TranslationMap()

let buffer: ArrayBuffer
let cursor: DataViewCursor

beforeEach(() => {
    buffer = new ArrayBuffer(256)
    cursor = new DataViewCursor(new DataView(buffer))
})

test('Same-version de/serialization', () => {
    const serializer = TaggedSerializer.create('foo', 1).initialVersion(PrimitiveSerializer.int32)
    const value = 132

    serializer.serialize(cursor, value)
    cursor.reset()
    
    expect(serializer.deserialize(cursor, translationMap)).toEqual(value)
})

test('Version changes', () => {
    const v1 = TaggedSerializer.create('foo', 1).initialVersion(PrimitiveSerializer.int32)
    const v2 = v1.newVersion(PrimitiveSerializer.bigInt64, BigInt)
    
    v1.serialize(cursor, 123)
    cursor.reset()

    expect(v2.deserialize(cursor, translationMap)).toEqual(123n)
})

test('Wrong type', () => {
    const type1 = TaggedSerializer.create('foo', 1).initialVersion(PrimitiveSerializer.int32)
    const type2 = TaggedSerializer.create('bar', 2).initialVersion(PrimitiveSerializer.int32)

    type1.serialize(cursor, 123)
    cursor.reset()

    expect(() => type2.deserialize(cursor, translationMap)).toThrow()
    expect(cursor.offset).toBe(0)
})

test('Invalid version', () => {
    const v1 = TaggedSerializer.create('foo', 1).initialVersion(PrimitiveSerializer.int32)
    const v2 = v1.newVersion(PrimitiveSerializer.bigInt64, BigInt)

    v2.serialize(cursor, 123n)
    cursor.reset()

    expect(() => v1.deserialize(cursor, translationMap)).toThrow()
    expect(cursor.offset).toBe(0)
})

test('Skips bytes equal to the underlying version', () => {
    const v1 = TaggedSerializer.create('foo', 1).initialVersion(PrimitiveSerializer.int32)
    const v2 = v1.newVersion(PrimitiveSerializer.bigInt64, BigInt)

    v1.serialize(cursor, 123)
    const expectedOffset = cursor.offset
    cursor.reset()

    v2.skip(cursor)
    expect(cursor.offset).toEqual(expectedOffset)
})
