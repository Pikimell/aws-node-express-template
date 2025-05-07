import createHttpError from "http-errors";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { CLIENT_ID, USER_POOL_ID } from "../helpers/constants.js";
import { getUserByCognito } from "../services/userService.js";

const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: "access",
  clientId: CLIENT_ID,
});

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return next(createHttpError(401, "Please provide Authorization header"));
    }

    const [bearer, token] = authHeader.split(" ");

    if (bearer !== "Bearer" || !token) {
      return next(createHttpError(401, "Auth header should be of type Bearer"));
    }

    const payload = await verifier.verify(token);
    const user = await getUserByCognito(payload.sub);

    req.user = user;
    req.typeAccount = payload["cognito:groups"]?.[0] || null;

    next();
  } catch (err) {
    console.error("JWT Verification error:", err);
    return next(createHttpError(401, "Invalid token"));
  }
};
