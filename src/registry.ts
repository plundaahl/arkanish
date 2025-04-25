import { GuiControllerRegistry } from './ui-state'
import { ActionHandlerRegistry } from './game-state/Level'
import { ParticleHandlerRegistry } from './game-state/Particles'
import { PrefabRegistry } from './game-state/Prefab'
import { ScriptHandlerRegistry } from './game-state/Script'
import { SceneRegistry } from './game-state/Scene'

export const Registry = {
    ...ActionHandlerRegistry,
    ...ScriptHandlerRegistry,
    ...ParticleHandlerRegistry,
    ...PrefabRegistry,
    ...GuiControllerRegistry,
    ...SceneRegistry,
}

export type Registry = typeof Registry
