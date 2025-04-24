import { createStateMachineHandler, StateMachineScript } from "./StateMachineScript";

const initState: StateMachineScript<'MissileFrigate'> = {
    type: "MissileFrigate"
}

export const MissileFrigateScriptHandler = createStateMachineHandler('MissileFrigate', initState)
