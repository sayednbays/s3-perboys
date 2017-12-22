import ActionTypes from '../actions/status.action';
export function handleReduxDataStatus(action, state, domain) {
    let nextState = state;
    switch (action.type) {
        case ActionTypes.loading:
            if (action.payload.domain === domain)
                nextState = { ...state, status: 'loading' };
            break;
        case ActionTypes.loaded:
            if (action.payload.domain === domain)
                nextState = { ...state, status: 'loaded' };
            break;
        case ActionTypes.error:
            if (action.payload.domain === domain)
                nextState = { ...state, error: action.payload.error };
            break;
        default:
            nextState = state;
            break;
    }
    return nextState;
}