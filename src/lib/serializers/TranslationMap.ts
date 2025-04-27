import { ITranslationMap, ISerializer } from "./Serializer"

type TranslationEntry<N extends string, T> = [ISerializer<N, T>, Map<T, T>]
type TMap = { [N in string]: TranslationEntry<N, any> }

export class TranslationMap implements ITranslationMap {
    private readonly map: TMap = {}
    private readonly keys: string[] = []

    constructor() {}

    addTranslation<N extends string, T>(
        serializer: ISerializer<N, T>,
        serializedValue: T,
        deserializedValue: T
    ): ITranslationMap {
        const key = serializer.name
        if (!this.map[key]) {
            this.map[key] = [serializer, new Map()]
            this.keys.push(key)
        }

        if (this.map[key][0] !== serializer) {
            throw new Error(`Tried to add a serializer with name [${serializer.name}], but that name is already in use.`)
        }

        this.map[key][1].set(serializedValue, deserializedValue)

        return this as any
    }

    translate<T>(serializer: ISerializer<string, T>, serializedValue: T): T {
        const key = serializer.name
        return this.map[key]?.[1].get(serializedValue) || serializedValue
    }

    clear(): void {
        for (const key of this.keys) {
            this.map[key][1].clear()
        }
    }
}
