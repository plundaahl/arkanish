import { Action, ActionHandler } from '../../game-state/Level'
import { GameState } from '../../game-state/GameState'
import { Prefab } from '../../game-state/Prefab'

interface SpawnPrefabAction extends Action<'SpawnPrefab'> {
    prefabId: string,
    x?: number
    y?: number,
}

interface SpawnPrefabActionHandler extends ActionHandler<'SpawnPrefab', SpawnPrefabAction, GameState> {
    create: (prefabId: string, x?: number | undefined, y?: number | undefined) => SpawnPrefabAction
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
        if (action.x !== undefined) {
            entity.posX = action.x
        }
        if (action.y !== undefined) {
            entity.posY = action.y
        }
    },
    create: (prefabId: string, x?: number | undefined, y?: number | undefined): SpawnPrefabAction => {
        return { type: 'SpawnPrefab', prefabId, x, y }
    }
}
