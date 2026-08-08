import type { Request } from "express";

export const getBearerToken = (authorization?: string) => {
  const [bearer, token] = authorization?.split(" ") ?? [];
  return bearer === "Bearer" ? token : undefined;
};

export const getRequestAccessToken = (req: Request) => {
  return getBearerToken(req.headers.authorization) ?? req.cookies?.accessToken;
};

export const getRequestRefreshToken = (req: Request) => {
  return req.cookies?.refreshToken ?? req.body?.refreshToken;
};
