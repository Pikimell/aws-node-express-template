import { RequestHandler } from "express";
import createHttpError from "http-errors";

import * as authServices from "../services/authService.js";
import { clearAuthCookies, setAuthCookies } from "../utils/authCookies.js";
import { getRequestAccessToken, getRequestRefreshToken } from "../utils/authTokens.js";

export const registerUserController: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const result = await authServices.registerUserService({
      email,
      password,
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const loginController: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const session = await authServices.loginService({ email, password });

    setAuthCookies(res, session);

    res.status(200).json({ accessToken: session.accessToken });
  } catch (err) {
    next(err);
  }
};

export const logoutController: RequestHandler = async (req, res, next) => {
  try {
    await authServices.logoutService(getRequestAccessToken(req));

    clearAuthCookies(res);

    res.status(200).json({ message: "Logged out successfully!" });
  } catch (err) {
    next(err);
  }
};

export const refreshController: RequestHandler = async (req, res, next) => {
  try {
    const refreshToken = getRequestRefreshToken(req);

    if (!refreshToken) {
      throw createHttpError(401, "Please provide refresh token");
    }

    const session = await authServices.refreshService(refreshToken);

    setAuthCookies(res, session);

    res.status(200).json({ accessToken: session.accessToken });
  } catch (err) {
    next(err);
  }
};

export const requestResetEmailController: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body as { email: string };
    await authServices.requestResetEmailService(email);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordController: RequestHandler = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body as {
      email: string;
      code: string;
      newPassword: string;
    };
    await authServices.resetPasswordService({ email, code, newPassword });
    res.status(200).json({ message: "Password successfully reset" });
  } catch (err) {
    next(err);
  }
};

export const confirmEmailController: RequestHandler = async (req, res, next) => {
  try {
    const { email, code } = req.body as { email: string; code: string };
    await authServices.confirmEmailService({ email, code });
    res.status(200).json({ message: "Email confirmed successfully!" });
  } catch (err) {
    next(err);
  }
};
