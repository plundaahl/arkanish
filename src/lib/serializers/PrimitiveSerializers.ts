import { DataViewCursor } from "./DataViewCursor"
import { NullValued, ISerializer } from "./Serializer"

export interface PrimitiveSerializer<N extends string, T> extends ISerializer<N, T>, NullValued<T> {}

const NullSerializer: PrimitiveSerializer<'Null', undefined> = {
    serialize() { },
    deserialize() { },
    skip() { },
    name: "Null",
    nullValue: undefined
}

const BooleanSerializer: PrimitiveSerializer<'Boolean', boolean> = {
    serialize(cursor, value) { cursor.setBoolean(value) },
    deserialize(cursor) { return cursor.getBoolean() },
    skip(cursor) { cursor.skipBoolean() },
    name: "Boolean",
    nullValue: false
}

const Uint8Serializer: PrimitiveSerializer<'Uint8', number> = {
    serialize(cursor, value) { cursor.setUint8(value) },
    deserialize(cursor) { return cursor.getUint8() },
    skip(cursor) { cursor.skip8() },
    name: "Uint8",
    nullValue: 0
}

const Uint16Serializer: PrimitiveSerializer<'Uint16', number> = {
    serialize(cursor, value) { cursor.setUint16(value) },
    deserialize(cursor) { return cursor.getUint16() },
    skip(cursor) { cursor.skip16() },
    name: "Uint16",
    nullValue: 0
}

const Uint32Serializer: PrimitiveSerializer<'Uint32', number> = {
    serialize(cursor, value) { cursor.setUint32(value) },
    deserialize(cursor) { return cursor.getUint32() },
    skip(cursor) { cursor.skip32() },
    name: "Uint32",
    nullValue: 0
}

const Int8Serializer: PrimitiveSerializer<'Int8', number> = {
    serialize(cursor, value) { cursor.setInt8(value) },
    deserialize(cursor) { return cursor.getInt8() },
    skip(cursor) { cursor.skip8() },
    name: "Int8",
    nullValue: 0
}

const Int16Serializer: PrimitiveSerializer<'Int16', number> = {
    serialize(cursor, value) { cursor.setInt16(value) },
    deserialize(cursor) { return cursor.getInt16() },
    skip(cursor) { cursor.skip16() },
    name: "Int16",
    nullValue: 0
}

const Int32Serializer: PrimitiveSerializer<'Int32', number> = {
    serialize(cursor, value) { cursor.setInt32(value) },
    deserialize(cursor) { return cursor.getInt32() },
    skip(cursor) { cursor.skip32() },
    name: "Int32",
    nullValue: 0
}

const Float32Serializer: PrimitiveSerializer<'Float32', number> = {
    serialize(cursor, value) { cursor.setFloat32(value) },
    deserialize(cursor) { return cursor.getFloat32() },
    skip(cursor) { cursor.skip32() },
    name: "Float32",
    nullValue: 0
}

const Float64Serializer: PrimitiveSerializer<'Float64', number> = {
    serialize(cursor, value) { cursor.setFloat64(value) },
    deserialize(cursor) { return cursor.getFloat64() },
    skip(cursor) { cursor.skip64() },
    name: "Float64",
    nullValue: 0
}

const BigInt64Serializer: PrimitiveSerializer<'BigInt64', bigint> = {
    serialize(cursor, value) { cursor.setBigInt64(value) },
    deserialize(cursor) { return cursor.getBigInt64() },
    skip(cursor) { cursor.skip64() },
    name: "BigInt64",
    nullValue: 0n
}

const BigUint64Serializer: PrimitiveSerializer<'BigUint64', bigint> = {
    serialize(cursor, value) { cursor.setBigUint64(value) },
    deserialize(cursor) { return cursor.getBigUint64() },
    skip(cursor) { cursor.skip64() },
    name: "BigUint64",
    nullValue: 0n
}

const StringSerializer: PrimitiveSerializer<'String', string> = {
    serialize(cursor: DataViewCursor, value: string): void { cursor.setString(value) },
    deserialize(cursor: DataViewCursor): string { return cursor.getString() },
    skip(cursor: DataViewCursor): void { cursor.getString() },
    name: "String",
    nullValue: ""
}

export const PrimitiveSerializer = {
    null: NullSerializer,
    boolean: BooleanSerializer,
    uint8: Uint8Serializer,
    uint16: Uint16Serializer,
    uint32: Uint32Serializer,
    int8: Int8Serializer,
    int16: Int16Serializer,
    int32: Int32Serializer,
    float32: Float32Serializer,
    float64: Float64Serializer,
    bigInt64: BigInt64Serializer,
    bigUint64: BigUint64Serializer,
    string: StringSerializer,
}
