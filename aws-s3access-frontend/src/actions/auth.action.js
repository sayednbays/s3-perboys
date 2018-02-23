import StatusActionTypes from './status.action';
import { awsCognito } from '../services/index';
import * as fileSystem from './file-system.action';

export const ActionTypes = {
    ...StatusActionTypes,
    login: 'auth.login',
    logout: 'auth.logout'
};
export function login(userName, password) {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: ActionTypes.loading, payload: { domain: 'auth' } });
            let userData = await awsCognito.login(userName, password);
            if (userData) {
                dispatch({ type: ActionTypes.login, payload: { userData: userData } });
                return { success: true };
            }
            return { success: false, reason: 'login failure' };

        }
        catch (err) {
            console.error(err);
            return { success: false, reason: err.message || err };
        }
        finally {
            dispatch({ type: ActionTypes.loaded, payload: { domain: 'auth' } });
        }
    }
}

export function checkIfLogged() {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: ActionTypes.loading, payload: { domain: 'auth' } });
            let userData = await awsCognito.isLogged();
            if (userData) {
                dispatch({ type: ActionTypes.login, payload: { userData: userData } });
                return true;
            }
            return false;

        }
        catch (err) {
            console.error(err);
            return false;
        }
        finally {
            dispatch({ type: ActionTypes.loaded, payload: { domain: 'auth' } });
        }
    }
}
export function logout() {

    return async (dispatch, getState) => {
        try {
            dispatch({ type: ActionTypes.loading, payload: { domain: 'auth' } });
            awsCognito.logout();
            dispatch({ type: ActionTypes.logout });
            dispatch(fileSystem.reset());
        }
        catch (err) {
            console.error(err);
        }
        finally {
            dispatch({ type: ActionTypes.loaded, payload: { domain: 'auth' } });
        }
    }

}