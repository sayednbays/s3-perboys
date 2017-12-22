
import { ActionTypes } from '../actions/auth.action';
import { handleReduxDataStatus } from './common.reducer';
function auth(state = { userData: null, logged: false, status: 'loaded', error: null }, action) {
    let nextState;
    switch (action.type) {
        case ActionTypes.login:
            if (action.payload) {
                const { userData } = action.payload;
                nextState = {
                    ...state, userData: userData, logged: true, error: null
                };
            }
            break;
        case ActionTypes.logout:
            nextState = { ...state, userData: null, logged: false, error: null }
            break;
        default:
            nextState = handleReduxDataStatus(action, state, 'auth');
            break;
    }
    return nextState || state;
}

export default auth;