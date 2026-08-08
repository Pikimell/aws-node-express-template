import type { Response } from "express";

import { ONE_HOUR, ONE_MONTH } from "../helpers/constants.js";
import type { AuthSession } from "../services/authService.js";

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

export const setAuthCookies = (res: Response, session: AuthSession) => {
  res.cookie("refreshToken", session.refreshToken, {
    ...authCookieOptions,
    maxAge: ONE_MONTH,
  });

  res.cookie("accessToken", session.accessToken, {
    ...authCookieOptions,
    maxAge: ONE_HOUR,
  });

  res.cookie("sessionId", session.idToken, {
    ...authCookieOptions,
    maxAge: ONE_HOUR,
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("refreshToken", authCookieOptions);
  res.clearCookie("accessToken", authCookieOptions);
  res.clearCookie("sessionId", authCookieOptions);
};
