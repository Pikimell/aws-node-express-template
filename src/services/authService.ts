import {
  AdminAddUserToGroupCommand,
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  GetTokensFromRefreshTokenCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  SignUpCommand,
  type AuthenticationResultType,
} from "@aws-sdk/client-cognito-identity-provider";
import createHttpError from "http-errors";

import { CLIENT_ID, USER_POOL_ID } from "../helpers/constants.js";
import { createUser } from "./userService.js";

const DEFAULT_USER_GROUP = "user";

const cognito = new CognitoIdentityProviderClient({});

export type AuthSession = {
  accessToken: string;
  idToken: string;
  refreshToken: string;
};

type RegisterPayload = {
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type ResetPasswordPayload = {
  email: string;
  code: string;
  newPassword: string;
};

type ConfirmEmailPayload = {
  email: string;
  code: string;
};

const deleteCognitoUser = async (email: string) => {
  await cognito.send(
    new AdminDeleteUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
    })
  );
};

const addUserToDefaultGroup = async (email: string) => {
  await cognito.send(
    new AdminAddUserToGroupCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      GroupName: DEFAULT_USER_GROUP,
    })
  );
};

const mapAuthResultToSession = (
  authResult: AuthenticationResultType,
  fallbackRefreshToken?: string
): AuthSession => {
  if (!authResult.AccessToken || !authResult.IdToken) {
    throw createHttpError(401, "Failed to create auth session");
  }

  const refreshToken = authResult.RefreshToken ?? fallbackRefreshToken;

  if (!refreshToken) {
    throw createHttpError(401, "Failed to create refresh session");
  }

  return {
    accessToken: authResult.AccessToken,
    idToken: authResult.IdToken,
    refreshToken,
  };
};

export const registerUserService = async ({ email, password }: RegisterPayload) => {
  const result = await cognito.send(
    new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: "email",
          Value: email,
        },
      ],
    })
  );

  if (!result.UserSub) {
    throw createHttpError(500, "Failed to register user");
  }

  try {
    await addUserToDefaultGroup(email);
    await createUser({
      nickname: email,
      cognitoSub: result.UserSub,
    });
  } catch (err) {
    try {
      await deleteCognitoUser(email);
    } catch (rollbackError) {
      console.error("Failed to rollback Cognito user:", rollbackError);
    }

    throw err;
  }

  return {
    message: "User registered successfully",
    userSub: result.UserSub,
  };
};

export const loginService = async ({
  email,
  password,
}: LoginPayload): Promise<AuthSession> => {
  const result = await cognito.send(
    new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    })
  );

  if (!result.AuthenticationResult) {
    throw createHttpError(401, "Invalid email or password");
  }

  return mapAuthResultToSession(result.AuthenticationResult);
};

export const logoutService = async (accessToken?: string) => {
  if (!accessToken) {
    return { message: "User already logged out" };
  }

  await cognito.send(
    new GlobalSignOutCommand({
      AccessToken: accessToken,
    })
  );

  return { message: "Logged out successfully" };
};

export const refreshService = async (refreshToken: string): Promise<AuthSession> => {
  const result = await cognito.send(
    new GetTokensFromRefreshTokenCommand({
      ClientId: CLIENT_ID,
      RefreshToken: refreshToken,
    })
  );

  if (!result.AuthenticationResult) {
    throw createHttpError(401, "Failed to refresh session");
  }

  return mapAuthResultToSession(result.AuthenticationResult, refreshToken);
};

export const requestResetEmailService = async (email: string) => {
  await cognito.send(
    new ForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
    })
  );

  return { message: "Password reset email sent" };
};

export const resetPasswordService = async ({
  email,
  code,
  newPassword,
}: ResetPasswordPayload) => {
  await cognito.send(
    new ConfirmForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    })
  );

  return { message: "Password successfully reset" };
};

export const confirmEmailService = async ({ email, code }: ConfirmEmailPayload) => {
  const result = await cognito.send(
    new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    })
  );

  return {
    message: "Email successfully confirmed",
    result: result.$metadata.requestId,
  };
};

export const disableUserService = async (email: string) => {
  await cognito.send(
    new AdminDisableUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
    })
  );

  return { message: "User has been disabled successfully" };
};

export const enableUserService = async (email: string) => {
  await cognito.send(
    new AdminEnableUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
    })
  );

  return { message: "User has been enabled successfully" };
};
