import AWS from 'aws-sdk';
import * as appConfig from '../config'
import { NetworkError } from './network-error';
import { httpService } from './index';

export async function listObjects(prefix) {
    try {
        let data = await httpService.post(appConfig.S3.apiEndPoint,
            { operation: 'listObjects', params: { prefix: prefix } });
        return data;
    }
    catch (err) {
        console.log(err);
    }

}

export async function getObject(key) {
    try {
        let data = await httpService.post(appConfig.S3.apiEndPoint,
            { operation: 'getObject', params: { key: key } });
        return data;
    }
    catch (err) {
        console.log(err);
    }

}
export async function putObject(key, body) {
    try {
        let data = await httpService.post(appConfig.S3.apiEndPoint,
            { operation: 'putObject', params: { key: key, body: body } });
        return data;
    }
    catch (err) {
        console.log(err);
    }
}

export async function deleteObject(key) {
    try {
        let data = await httpService.post(appConfig.S3.apiEndPoint,
            { operation: 'deleteObject', params: { key: key } });
        return data;
    }
    catch (err) {
        console.log(err);
    }
}

