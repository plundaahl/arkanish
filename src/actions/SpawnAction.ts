import { Action, ActionHandler } from '../game-state/Level'
import { Entity, EntityTemplate, World } from '../game-state/Entity'
import { GameState } from '../game-state/GameState'
import { Script } from '../scripts/Script'

interface SpawnAction extends Action<'Spawn'> {
    overrides: EntityTemplate
}

interface SpawnActionHandler extends ActionHandler<'Spawn', SpawnAction, GameState> {
    create: (template: EntityTemplate) => SpawnAction
}

export const SpawnActionHandler: SpawnActionHandler = {
    type: 'Spawn',
    is: (obj: unknown): obj is SpawnAction => {
        return typeof obj === 'object'
           && (obj as any).type === 'Spawn'
           && typeof (obj as any).overrides === 'object'
           && EntityTemplate.is((obj as any).overrides)
    },
    execute: (state: GameState, action: SpawnAction): void => {
        const spec = EntityTemplate.toEntitySpec(action.overrides)
        const entity = World.spawnEntity(state, spec)
        if (action.overrides.script) {
            Script.attachScript(state, entity, action.overrides.script)
        }
        console.log(action.overrides)
        console.log(spec)
        console.log(entity)
    },
    create: (template: EntityTemplate): SpawnAction => {
        return { type: 'Spawn', overrides: template }
    }
}
