import StatusActionTypes from './status.action';
import { awsS3, util } from '../services/index';

export const ActionTypes = {
    ...StatusActionTypes,
    listContents: 'fileSystem.listContent',
    reset: 'fileSystem.reset'
};
export function listContentsUnderPath(path) {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: ActionTypes.loading, payload: { domain: 'fileSystem' } });

            let payload = await awsS3.listObjects(path);
            if (payload && payload.data) {
                const { CommonPrefixes, Contents } = payload.data;
                let folders = CommonPrefixes.map(item => ({ type: 'folder', path: item.Prefix, }));
                let files = Contents.filter(item => item.Key && !item.Key.endsWith('/'))
                    .map(item => {
                        return { type: 'file', path: item.Key, size: item.Size };
                    });

                dispatch({ type: ActionTypes.listContents, payload: { path, contents: [...folders, ...files] } });
            }
        }
        catch (err) {
            console.error(err);
            dispatch({ type: ActionTypes.error, payload: { error: err } });
        }
        finally {
            dispatch({ type: ActionTypes.loaded, payload: { domain: 'fileSystem' } });
        }
    }
}
export function downloadFile(path) {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: ActionTypes.loading, payload: { domain: 'fileSystem' } });

            let payload = await awsS3.getObject(path);
            if (payload && payload.data) {
                const { url } = payload.data;
                util.downloadFile(url);

            }
        }
        catch (err) {
            console.error(err);
            dispatch({ type: ActionTypes.error, payload: { error: err } });
        }
        finally {
            dispatch({ type: ActionTypes.loaded, payload: { domain: 'fileSystem' } });
        }
    }
}
export function createFolder(path, folderName) {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: ActionTypes.loading, payload: { domain: 'fileSystem' } });

            let key = path + folderName + '/';
            await awsS3.putObject(key);

            dispatch(listContentsUnderPath(path));
        }
        catch (err) {
            console.error(err);
            dispatch({ type: ActionTypes.error, payload: { error: err } });
        }
        finally {
            dispatch({ type: ActionTypes.loaded, payload: { domain: 'fileSystem' } });
        }
    }
}
export function deletePaths(paths) {
    return async (dispatch, getState) => {
        try {
            if (paths.length === 0) return;
            dispatch({ type: ActionTypes.loading, payload: { domain: 'fileSystem' } });

            for (let i = 0; i < paths.length; i++) {
                let path = paths[i];
                await awsS3.deleteObject(path);

            }
            let path = paths[0];
            if (!path.endsWith('/'))
                path += '/';
            let segments = path.split('/');
            let parentPath = segments.slice(0, Math.max(segments.length - 2, 0)).join('/') + '/';
            await dispatch(listContentsUnderPath(parentPath));
        }
        catch (err) {
            console.error(err);
            dispatch({ type: ActionTypes.error, payload: { error: err } });
        }
        finally {
            dispatch({ type: ActionTypes.loaded, payload: { domain: 'fileSystem' } });
        }
    }
}


export function uploadFiles(path, files) {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: ActionTypes.loading, payload: { domain: 'fileSystem' } });

            for (let i = 0; i < files.length; i++) {
                let key = path + files[i].name;
                await awsS3.putObject(key, files[i].data);
            }
            await dispatch(listContentsUnderPath(path));
        }
        catch (err) {
            console.error(err);
            dispatch({ type: ActionTypes.error, payload: { error: err } });
        }
        finally {
            dispatch({ type: ActionTypes.loaded, payload: { domain: 'fileSystem' } });
        }
    }
}

export function reset() {
    return (dispatch, getState) => {
        dispatch({ type: ActionTypes.reset });
    }
}
