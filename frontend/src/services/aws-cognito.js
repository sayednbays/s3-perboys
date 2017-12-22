

import AWS from "aws-sdk";
import { CognitoUserPool, CognitoUser, AuthenticationDetails, } from 'amazon-cognito-identity-js';
import * as appConfig from '../config';
import { persistent } from "./index";

const poolData = {
    UserPoolId: appConfig.Cognito.UserPoolId,
    ClientId: appConfig.Cognito.ClientId
};

AWS.config.region = appConfig.Cognito.region;

const userPool = new CognitoUserPool(poolData);

export function login(userName, password) {
    let authenticationData = {
        Username: userName,
        Password: password,
    };
    let authenticationDetails = new AuthenticationDetails(authenticationData);

    let userData = {
        Username: userName,
        Pool: userPool
    };
    let cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
        let authCallbacks = {
            onSuccess: (result) => {
                console.log('onSuccess');

                let idToken = result.getIdToken();
                console.log(idToken);

                updateAwsCredentials(idToken.getJwtToken());

                //refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
                AWS.config.credentials.refresh((error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(idToken.decodePayload());
                    }
                });
            },

            onFailure: (err) => {
                reject(err);
            }
        };
        cognitoUser.authenticateUser(authenticationDetails, {
            ...authCallbacks,
            newPasswordRequired: (userAttributes, requiredAttributes) => {
                if (!userAttributes.email_verified)
                    userAttributes.email = 'info@cloud.com';

                if (!userAttributes.phone_number_verified)
                    userAttributes.phone_number = '+123456789';

                delete userAttributes.email_verified;
                delete userAttributes.phone_number_verified;

                cognitoUser.completeNewPasswordChallenge(password, userAttributes, authCallbacks)
            }
        });
    });

}
export function isLogged() {
    return new Promise((resolve, reject) => {
        let user = userPool.getCurrentUser();
        if (user != null) {
            user.getSession((err, result) => {
                if (result) {
                    // Add the User's Id Token to the Cognito credentials login map.
                    let idToken = result.getIdToken();
                    updateAwsCredentials(idToken.getJwtToken());
                    resolve(idToken.decodePayload());
                }
            });
        }
        resolve(false);
    })
};

export function logout() {
    let user = userPool.getCurrentUser();
    user && user.signOut();
    localStorage.clear();

}
function updateAwsCredentials(token) {
    let logins = {};
    let id = `cognito-idp.${appConfig.Cognito.region}.amazonaws.com/${appConfig.Cognito.UserPoolId}`;
    logins[id] = token;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: appConfig.Cognito.IdentityPoolId,
        Logins: logins
    });

    persistent.set('idToken', token);
}