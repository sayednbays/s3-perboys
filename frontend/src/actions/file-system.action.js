import StatusActionTypes from './status.action';
import { awsS3, util } from '../services/index';

export const ActionTypes = {
    ...StatusActionTypes,
    listContents: 'fileSystem.listContent',
    reset:'fileSystem.reset'
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
                const { Body, ContentType } = payload.data;
                const { data } = Body;

                let segments = path.split('/');
                let fileName = segments[segments.length - 1];
                util.saveByteArrayAsFile(data, fileName);

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
export function deleteFolderOrFile(path) {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: ActionTypes.loading, payload: { domain: 'fileSystem' } });

            await awsS3.deleteObject(path);
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


export function uploadFile(path, fileName, file) {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: ActionTypes.loading, payload: { domain: 'fileSystem' } });

            let key = path + fileName;
            await awsS3.putObject(key, file);

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
    return  (dispatch, getState) => {
        dispatch({ type: ActionTypes.reset });
    }
}
