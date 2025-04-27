import { DataViewCursor } from "./DataViewCursor"

export interface ISerializer<N extends string, T> {
    name: N
    serialize(cursor: DataViewCursor, value: T): void
    deserialize(cursor: DataViewCursor, translationMap: ITranslationMap, destination?: T): T
    skip(cursor: DataViewCursor): void
}

export interface NullValued<T> {
    nullValue: T
}

export interface Tagged {
    typeId: number
}

export interface ITranslationMap {
    addTranslation<N extends string, T>(
        serializer: ISerializer<N, T>,
        serializedValue: T,
        deserializedValue: T
    ): ITranslationMap

    translate<T>(serializer: ISerializer<string, T>, serializedValue: T): T 

    clear(): void
}
