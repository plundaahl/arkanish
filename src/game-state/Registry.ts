import { ActionHandlerRegistry } from './Level'
import { ParticleHandlerRegistry } from './Particles'
import { PrefabRegistry } from './Prefab'
import { ScriptHandlerRegistry } from './Script'

export const Registry = {
    ...ActionHandlerRegistry,
    ...ScriptHandlerRegistry,
    ...ParticleHandlerRegistry,
    ...PrefabRegistry,
}

export type Registry = typeof Registry
