import { DataViewCursor } from "./DataViewCursor";
import { NullValued, ISerializer, ITranslationMap } from "./Serializer";

export class ArraySerializer<N extends string, T> implements ISerializer<`ArrayOf${N}`, T[]>, NullValued<T[]> {
    public readonly name: `ArrayOf${N}`

    private constructor(private readonly delegate: ISerializer<N, T>) {
        this.name = `ArrayOf${delegate.name}`
    }

    public readonly nullValue: T[] = []

    static create<N extends string, T>(delegate: ISerializer<N, T>): ArraySerializer<any, T> {
        return new ArraySerializer(delegate)
    }

    serialize(cursor: DataViewCursor, value: T[]): void {
        cursor.setUint16(value.length)
        for (const element of value) {
            this.delegate.serialize(cursor, element)
        }
    }

    deserialize(cursor: DataViewCursor, translationMap: ITranslationMap, destination?: T[] | undefined): T[] {
        destination = destination || []

        const len = cursor.getUint16()
        for (let i = 0; i < len; i++) {
            destination[i] = this.delegate.deserialize(cursor, translationMap, destination[i])
        }

        return destination
    }

    skip(cursor: DataViewCursor): void {
        const len = cursor.getUint16()
        for (let i = 0; i < len; i++) {
            this.delegate.skip(cursor)
        }
    }
}
