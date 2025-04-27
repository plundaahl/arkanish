import { DataViewCursor } from "./DataViewCursor";
import { ISerializer, ITranslationMap } from "./Serializer";

export class TranslatedSerializer<N extends string, T> implements ISerializer<`Translated${N}`, T> {

    public readonly name: `Translated${N}`

    private constructor(private readonly delegate: ISerializer<N, T>) {
        this.name = `Translated${delegate.name}`
    }

    static create<N extends string, T>(delegate: ISerializer<N, T>): TranslatedSerializer<N, T> {
        return new TranslatedSerializer(delegate)
    }

    serialize(cursor: DataViewCursor, value: T): void {
        return this.delegate.serialize(cursor, value)
    }

    deserialize(cursor: DataViewCursor, translationMap: ITranslationMap, destination?: T | undefined): T {
        return translationMap.translate(this, this.delegate.deserialize(cursor, translationMap, destination))
    }

    skip(cursor: DataViewCursor): void {
        return this.delegate.skip(cursor)
    }
}
