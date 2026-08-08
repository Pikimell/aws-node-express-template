import crypto from "crypto";

import { query } from "../database/postgres.js";
import type { Session } from "../database/models/session.js";

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
  const result = await query<Session>(
    `
      insert into sessions (user_id, refresh_token, expires_at, user_agent, ip)
      values ($1, $2, $3, $4, $5)
      returning
        id as "_id",
        user_id as "userId",
        refresh_token as "refreshToken",
        expires_at as "expiresAt",
        user_agent as "userAgent",
        ip,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `,
    [userId, hashedToken, expiresAt, userAgent ?? null, ip ?? null]
  );

  return result.rows[0];
};

export const getSessionByToken = async (refreshToken: string) => {
  const hashedToken = hashToken(refreshToken);
  const result = await query<Session>(
    `
      select
        id as "_id",
        user_id as "userId",
        refresh_token as "refreshToken",
        expires_at as "expiresAt",
        user_agent as "userAgent",
        ip,
        created_at as "createdAt",
        updated_at as "updatedAt"
      from sessions
      where refresh_token = $1
      limit 1
    `,
    [hashedToken]
  );

  return result.rows[0] ?? null;
};

export const deleteSessionByToken = async (refreshToken: string) => {
  const hashedToken = hashToken(refreshToken);
  return query("delete from sessions where refresh_token = $1", [hashedToken]);
};

export const rotateSession = async (
  sessionId: string,
  refreshToken: string,
  expiresAt: Date,
  meta?: RotateSessionMeta
) => {
  const hashedToken = hashToken(refreshToken);
  const result = await query<Session>(
    `
      update sessions
      set
        refresh_token = $2,
        expires_at = $3,
        user_agent = coalesce($4, user_agent),
        ip = coalesce($5, ip),
        updated_at = now()
      where id = $1
      returning
        id as "_id",
        user_id as "userId",
        refresh_token as "refreshToken",
        expires_at as "expiresAt",
        user_agent as "userAgent",
        ip,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `,
    [sessionId, hashedToken, expiresAt, meta?.userAgent ?? null, meta?.ip ?? null]
  );

  return result.rows[0] ?? null;
};
