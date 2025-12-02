import AWS from "aws-sdk";
import { AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool, } from "amazon-cognito-identity-js";
import { CLIENT_ID, USER_POOL_ID } from "../helpers/constants.js";
import { createUser } from "./userService.js";
const poolData = {
    UserPoolId: USER_POOL_ID,
    ClientId: CLIENT_ID,
};
const userPool = new CognitoUserPool(poolData);
const cognito = new AWS.CognitoIdentityServiceProvider();
const getCognitoUser = (email) => {
    return new CognitoUser({
        Username: email,
        Pool: userPool,
    });
};
const getAuthDetails = (email, password) => {
    return new AuthenticationDetails({
        Username: email,
        Password: password,
    });
};
export const registerUserService = async ({ email, password, group, }) => {
    return new Promise((resolve, reject) => {
        const attributeList = [
            new CognitoUserAttribute({
                Name: "email",
                Value: email,
            }),
        ];
        userPool.signUp(email, password, attributeList, [], (err, result) => {
            if (err || !result?.userSub) {
                return reject(err ?? new Error("Failed to register user"));
            }
            const userSub = result.userSub;
            if (group) {
                cognito
                    .adminAddUserToGroup({
                    UserPoolId: USER_POOL_ID,
                    Username: email,
                    GroupName: group,
                })
                    .promise()
                    .then(async () => {
                    await createUser({
                        nickname: email,
                        password,
                        cognitoSub: userSub,
                    });
                    resolve({ message: "User registered and added to group", userSub });
                })
                    .catch((groupError) => {
                    console.error("Помилка додавання до групи:", groupError);
                    reject(groupError);
                });
            }
            else {
                resolve({ message: "User registered successfully", userSub });
            }
        });
    });
};
export const loginService = async ({ email, password }) => {
    return new Promise((resolve, reject) => {
        getCognitoUser(email).authenticateUser(getAuthDetails(email, password), {
            onSuccess: (result) => {
                resolve({
                    accessToken: result.getAccessToken().getJwtToken(),
                    idToken: result.getIdToken().getJwtToken(),
                    refreshToken: result.getRefreshToken().getToken(),
                });
            },
            onFailure: (err) => {
                console.log("Login Service error", err);
                reject(err);
            },
        });
    });
};
export const logoutService = async () => {
    return new Promise((resolve, reject) => {
        try {
            const currentUser = userPool.getCurrentUser();
            if (!currentUser) {
                return resolve({ message: "User already logged out" });
            }
            currentUser.signOut();
            resolve({ message: "Logged out successfully" });
        }
        catch (err) {
            reject(err);
        }
    });
};
export const refreshService = async () => {
    return new Promise((resolve, reject) => {
        const currentUser = userPool.getCurrentUser();
        if (!currentUser) {
            return reject(new Error("No user logged in"));
        }
        currentUser.getSession((err, session) => {
            if (err || !session?.isValid()) {
                return reject(new Error("Session is invalid or expired"));
            }
            currentUser.refreshSession(session.getRefreshToken(), (refreshErr, newSession) => {
                if (refreshErr || !newSession) {
                    return reject(refreshErr ?? new Error("Failed to refresh session"));
                }
                resolve({
                    accessToken: newSession.getAccessToken().getJwtToken(),
                    idToken: newSession.getIdToken().getJwtToken(),
                    refreshToken: newSession.getRefreshToken().getToken(),
                });
            });
        });
    });
};
export const requestResetEmailService = async (email) => {
    return new Promise((resolve, reject) => {
        const cognitoUser = getCognitoUser(email);
        cognitoUser.forgotPassword({
            onSuccess: () => resolve({ message: "Password reset email sent" }),
            onFailure: (err) => reject(err),
        });
    });
};
export const resetPasswordService = async ({ email, code, newPassword }) => {
    return new Promise((resolve, reject) => {
        const cognitoUser = getCognitoUser(email);
        cognitoUser.confirmPassword(code, newPassword, {
            onSuccess: () => resolve({ message: "Password successfully reset" }),
            onFailure: (err) => reject(err),
        });
    });
};
export const confirmEmailService = async ({ email, code }) => {
    return new Promise((resolve, reject) => {
        const cognitoUser = getCognitoUser(email);
        cognitoUser.confirmRegistration(code, true, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve({ message: "Email successfully confirmed", result });
        });
    });
};
export const disableUserService = async (email) => {
    try {
        await cognito
            .adminDisableUser({
            UserPoolId: USER_POOL_ID,
            Username: email,
        })
            .promise();
        return { message: "User has been disabled successfully" };
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        throw new Error(`Failed to disable user: ${message}`);
    }
};
export const enableUserService = async (email) => {
    try {
        await cognito
            .adminEnableUser({
            UserPoolId: USER_POOL_ID,
            Username: email,
        })
            .promise();
        return { message: "User has been enabled successfully" };
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        throw new Error(`Failed to enable user: ${message}`);
    }
};
