import { Action, ActionHandler } from '../../game-state/Level'
import { GameState } from '../../game-state/GameState'
import { Prefab } from '../../game-state/Prefab'
import { Entity, EntitySpec } from '../../game-state/Entity'

interface SpawnPrefabAction extends Action<'SpawnPrefab'> {
    prefabId: string,
    overrides?: EntitySpec
    x?: number
    y?: number,
}

interface SpawnPrefabActionHandler extends ActionHandler<'SpawnPrefab', SpawnPrefabAction, GameState> {
    create: (prefabId: string, overrides?: EntitySpec) => SpawnPrefabAction
}

export const SpawnPrefabActionHandler: SpawnPrefabActionHandler = {
    type: 'SpawnPrefab',
    is: (obj: unknown): obj is SpawnPrefabAction => {
        return typeof obj === 'object'
           && (obj as any).type === 'SpawnPrefab'
           && ['number', 'undefined'].includes(typeof (obj as any).x)
           && ['number', 'undefined'].includes(typeof (obj as any).y)
    },
    execute: (state: GameState, action: SpawnPrefabAction): void => {
        const entity = Prefab.spawn(state, action.prefabId)
        if (action.overrides) {
            Entity.populateFromSpec(entity, action.overrides)
        }
    },
    create: (prefabId: string, overrides?: EntitySpec): SpawnPrefabAction => {
        return { type: 'SpawnPrefab', prefabId, overrides }
    }
}
