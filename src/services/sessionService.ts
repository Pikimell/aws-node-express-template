import crypto from "crypto";

import { SessionCollection } from "../database/models/session.js";

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

type CreateSessionArgs = {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  userAgent?: string;
  ip?: string;
};

type RotateSessionMeta = {
  userAgent?: string;
  ip?: string;
};

export const createSession = async ({
  userId,
  refreshToken,
  expiresAt,
  userAgent,
  ip,
}: CreateSessionArgs) => {
  const hashedToken = hashToken(refreshToken);
  return SessionCollection.create({
    userId,
    refreshToken: hashedToken,
    expiresAt,
    userAgent,
    ip,
  });
};

export const getSessionByToken = async (refreshToken: string) => {
  const hashedToken = hashToken(refreshToken);
  return SessionCollection.findOne({ refreshToken: hashedToken });
};

export const deleteSessionByToken = async (refreshToken: string) => {
  const hashedToken = hashToken(refreshToken);
  return SessionCollection.deleteOne({ refreshToken: hashedToken });
};

export const rotateSession = async (
  sessionId: string,
  refreshToken: string,
  expiresAt: Date,
  meta?: RotateSessionMeta
) => {
  const hashedToken = hashToken(refreshToken);
  const update: Record<string, unknown> = {
    refreshToken: hashedToken,
    expiresAt,
  };
  if (meta?.userAgent) {
    update.userAgent = meta.userAgent;
  }
  if (meta?.ip) {
    update.ip = meta.ip;
  }

  return SessionCollection.findByIdAndUpdate(sessionId, update, {
    new: true,
  });
};
