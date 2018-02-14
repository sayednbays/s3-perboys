const AWS = require('aws-sdk');
const Config = require('./config');

AWS.config.update({ region: Config.S3.region });
const s3 = new AWS.S3();
const util = require('util');
const AdmZip = require('adm-zip');


exports.handler = (event, context, callback) => {
    try {

        //data from end user
        const { body } = event;

        //check input data from client if valid, if not we return the error (bad request) to end user
        let error = validateReuqestBody(body);
        if (error) {
            callbackForResponse({ statusCode: 400, message: error }, null, callback);
            return;
        }

        let requestBody = body;
        if (typeof body === 'string') {
            requestBody = JSON.parse(body);
        }
        const { operation, params } = requestBody;
        //client request operations
        switch (operation) {
            //this is a unzip file operation
            case 'unzip':
                //zip_file_key: the location of zip file at the s3 bucket
                //out_dir_key: the folder location of s3 to save unzip files
                //Config.S3.bucketName: the bucket name of S3
                const { zip_file_key, out_dir_key } = params;

                //get the zip file from the s3 buket
                s3.getObject({
                    Bucket: Config.S3.bucketName,
                    Key: zip_file_key
                }, (err, data) => {
                    //can not find the zip file, return message to client
                    if (err) {
                        callbackForResponse({ message: 'can not find the zip file' }, null, callback);
                        return;
                    }

                    //if it's a empty/invalid zip file, return message to client
                    if (!data) callbackForResponse(null, 'No Data!', callback);

                    try {
                        //extract the zip files and save to them to another s3 folder
                        let zip = new AdmZip(data.Body);

                        //sometime the AdmZip contains files without file name
                        //filter the entries have the file name;
                        let zipEntries = zip.getEntries().filter(item => !!item.name);

                        let results = [];
                        // loop the files in a zip
                        for (let i = 0; i < zipEntries.length; i++) {
                            let zipEntry = zipEntries[i];
                            let fileName = zipEntry.name;
                            let params = {
                                Bucket: Config.S3.bucketName,
                                Key: out_dir_key + fileName,
                                ACL: 'bucket-owner-full-control',
                                //the file content
                                Body: zipEntry.getData()
                            };
                            // save them to another folder
                            s3.upload(params, (err, result) => {
                                //return results or errors to end user
                                results.push({ err, location: result.Location });

                                //finish the unzip processing
                                if (results.length === zipEntries.length) {
                                    callbackForResponse(null, results, callback);
                                }
                            });
                        }
                    } catch (error) {
                        callbackForResponse(error, null, callback);
                    }

                });
                break;
            default:
                callbackForResponse({ statusCode: 400, message: 'can not run this operation' }, null, callback);
                break;
        }
    } catch (error) {

        callbackForResponse({ statusCode: 400, message: error.message }, null, callback);
    }

};

function validateReuqestBody(bodyData) {
    let requestBody = bodyData;
    if (bodyData && typeof bodyData === 'string') {
        requestBody = JSON.parse(bodyData);
    }

    const { operation, params } = requestBody || {}
    if (!operation || !params)
        return "operation or params argument are required";

    return null;
}

function callbackForResponse(error, result, callback) {
    let response = { statusCode: 200, body: null, headers: { "Access-Control-Allow-Origin": "*" } }
    if (error) {
        console.error(util.format({ error }) + '\r\n');
        response.statusCode = error.statusCode || 400;
        response.body = JSON.stringify({ message: error.message });
        callback(null, response);
        return;
    }

    response.statusCode = 200;
    response.body = JSON.stringify(result);
    callback(null, response);

}