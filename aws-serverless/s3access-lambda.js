const AWS = require('aws-sdk');
const Config = require('./config');

AWS.config.update({ region: Config.S3.region });
const s3 = new AWS.S3();

// this lambda function will run as proxy of http api gateway
// event: is the data from API Gateway which contains the request data and the authenticated user information
// content: is the runtime information that the lambda running
// callback: we use this function to return response data to end user
exports.handler = (event, context, callback) => {
    //the data will return the end user
    let response = { statusCode: 200, body: null, headers: { "Access-Control-Allow-Origin": "*" } };

    //data from end user
    const { body, requestContext } = event;
    const { authorizer } = requestContext || {};

    //this is authenticated user claims information
    const { claims } = authorizer || {};

    //check input data from end user if valid, if not we return the error (bad request) to end user
    let error = validateReuqestBody(body);
    if (error) {
        response.statusCode = 400;
        response.body = JSON.stringify({ message: error });
        callback(null, response);
        return;
    }

    let requestBody = JSON.parse(body);
    const { operation, params } = requestBody;

    // absolute path of user home folder, all S3 operations will happen under this user home folder and 
    //it's sub folders. user no permissions for other folders
    //sub is the uuid of user (you can get it from the sub attribute of cognito user pool too)
    const userHomeFolderPrefix = `users/${claims.sub}`;

    //S3 operations
    switch (operation) {
        //list folders and files under the corresponding path
        case 'listObjects':
            {
                const { prefix } = params;
                let userPrefix = `${userHomeFolderPrefix}${prefix}`;
                s3.listObjectsV2({
                    Bucket: Config.S3.bucketName, Delimiter: '/', Prefix: userPrefix,
                }, (err, result) => {

                    let trimResult = result;
                    if (result) {
                        //remove absolute s3 path of user home folder, only return the relative path to end users.
                        let strResult = JSON.stringify(result).replace(new RegExp(userHomeFolderPrefix, 'g'), '');
                        trimResult = JSON.parse(strResult);
                    }
                    //return  result or error to end user
                    handleS3Callback(err, trimResult, callback);

                });
            }
            break;
        //download file from s3
        case 'getObject':
            {
                const { key } = params;
                let userKey = userHomeFolderPrefix + key;
                s3.getObject({
                    Bucket: Config.S3.bucketName, Key: userKey,
                }, (err, result) => {
                    //return  result or error to end user
                    handleS3Callback(err, result, callback);

                });
            }
            break;
        //create folder or upload file
        case 'putObject':
            {
                const { key, body } = params;
                let userKey = userHomeFolderPrefix + key;
                //upload file
                if (body) {
                    //conver the file data (base64 encode from client) to binary
                    let buf = new Buffer(body.replace(/^data:image\/\w+;base64,/, ""), 'base64');
                    s3.upload({
                        Bucket: Config.S3.bucketName, Key: userKey, Body: buf,ACL:'bucket-owner-full-control'
                    }, (err, result) => {
                        //return  result or error to end user
                        handleS3Callback(err, result, callback);

                    });
                }
                //folder creation
                else {
                    s3.putObject({
                        Bucket: Config.S3.bucketName, Key: userKey,ACL:'bucket-owner-full-control'
                    }, (err, result) => {
                        //return  result or error to end user
                        handleS3Callback(err, result, callback);

                    });
                }
            }
            break;
        case 'deleteObject':
            {
                const { key } = params;
                let userKey = userHomeFolderPrefix + key;
               
                s3.deleteObject({
                    Bucket: Config.S3.bucketName, Key: userKey
                }, (err, result) => {
                    //return  result or error to end user
                    handleS3Callback(err, result, callback);

                });


            }
            break;
        default:
            response.statusCode = 400;
            response.body = JSON.stringify({ message: 'can not run the operation' });
            callback(null, response);
            break;
    }


};

function checkOrCreateUserHomeFolder() {
}
function handleS3Callback(s3Error, s3Result, lambdaCallback) {
    let response = { statusCode: 200, body: null, headers: { "Access-Control-Allow-Origin": "*" } }

    if (s3Error) {
        console.error(s3Error);
        response.statusCode = s3Error.statusCode || 400;
        response.body = JSON.stringify({ message: s3Error });
        lambdaCallback(null, response);
        return;
    }

    response.statusCode = 200;
    response.body = JSON.stringify({ data: s3Result });
    lambdaCallback(null, response);

}
function validateReuqestBody(bodyData) {
    let requestBody = null;
    if (bodyData)
        requestBody = JSON.parse(bodyData);

    if (!requestBody) {
        return "post data is required";
    }
    const { operation, params } = requestBody;
    if (!operation || !params)
        return "required field is missing";

    return null;
}
