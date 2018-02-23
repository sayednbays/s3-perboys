import * as appConfig from '../config'
import { httpService } from './index';

export async function listObjects(prefix) {
    let data = await httpService.post(appConfig.S3.apiEndPoint,
        { operation: 'listObjects', params: { prefix: prefix } });
    return data;

}

export async function getObject(key) {
    let data = await httpService.post(appConfig.S3.apiEndPoint,
        { operation: 'getObject', params: { key: key } });
    return data;
}
export async function getObjects(keys) {
    let data = await httpService.post(appConfig.S3.apiEndPoint,
        { operation: 'getObjects', params: { keys: keys } });
    return data;
}
export async function putObject(key, body) {
    let data = await httpService.post(appConfig.S3.apiEndPoint,
        { operation: 'putObject', params: { key: key, body: body } });
    return data;
}

export async function deleteObject(key) {
    let data = await httpService.post(appConfig.S3.apiEndPoint,
        { operation: 'deleteObject', params: { key: key } });
    return data;
}

