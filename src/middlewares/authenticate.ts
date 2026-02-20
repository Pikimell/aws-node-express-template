import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import type { Request, RequestHandler } from 'express';

import { ACCESS_TOKEN_SECRET } from '../helpers/constants.js';
import { getUserById } from '../services/userService.js';

type AccessTokenPayload = jwt.JwtPayload & {
  sub: string;
  email: string;
  role?: string;
};

const resolveTokenFromRequest = (req: Request): string | null => {
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  const bearerHeader = req.headers['authorization'];

  if (!bearerHeader) {
    return null;
  }

  const headerValue = Array.isArray(bearerHeader)
    ? bearerHeader[0]
    : bearerHeader;
  const [scheme, token] = headerValue.split(' ');

  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
    return null;
  }

  return token;
};

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const token = resolveTokenFromRequest(req);

    if (!token) {
      return next(createHttpError(401, 'Access token is missing'));
    }

    const payload = jwt.verify(
      token,
      ACCESS_TOKEN_SECRET,
    ) as AccessTokenPayload;
    const user = await getUserById(payload.sub);

    req.user = user;
    req.typeAccount = payload.role ?? null;

    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return next(createHttpError(401, 'Invalid access token'));
    }
    next(err);
  }
};
