
import { combineReducers } from 'redux';
import auth from './auth.reducer';
import fileSystem from './file-system.reducer';
const appReducer = combineReducers({
    auth,
    fileSystem
});

export default appReducer;