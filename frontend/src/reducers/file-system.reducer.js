
import { ActionTypes } from '../actions/file-system.action';
import { handleReduxDataStatus } from './common.reducer';
function fileSystem(state = { curPath: '/', contents: [], status: 'loaded', error: null }, action) {
    let nextState;
    switch (action.type) {
        case ActionTypes.listContents:
            if (action.payload) {
                const { path, contents } = action.payload;
                nextState = {
                    ...state, curPath: path, contents: contents, error: null
                };
            }
            break;
        case ActionTypes.reset:
            nextState = { ...state, curPath: '/', contents: [], error: null };
            break;
        default:
            nextState = handleReduxDataStatus(action, state, 'fileSystem');
            break;
    }
    return nextState || state;
}

export default fileSystem;