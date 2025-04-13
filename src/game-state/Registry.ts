import { ActionHandlerRegistry } from './Level'
import { ParticleHandlerRegistry } from './Particles'
import { PrefabRegistry } from './Prefab'
import { ScriptRegistry } from './Script'

export const Registry = {
    ...ActionHandlerRegistry,
    ...ScriptRegistry,
    ...ParticleHandlerRegistry,
    ...PrefabRegistry,
}

export type Registry = typeof Registry
