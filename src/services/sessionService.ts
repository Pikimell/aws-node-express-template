import crypto from "crypto";

import { supabase } from "../database/supabase.js";
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

type SessionRow = {
  id: string;
  user_id: string;
  refresh_token: string;
  expires_at: string;
  user_agent: string | null;
  ip: string | null;
  created_at: string;
  updated_at: string;
};

const sessionSelect =
  "id,user_id,refresh_token,expires_at,user_agent,ip,created_at,updated_at";

const mapSession = (row: SessionRow): Session => ({
  _id: row.id,
  userId: row.user_id,
  refreshToken: row.refresh_token,
  expiresAt: new Date(row.expires_at),
  userAgent: row.user_agent,
  ip: row.ip,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

export const createSession = async ({
  userId,
  refreshToken,
  expiresAt,
  userAgent,
  ip,
}: CreateSessionArgs) => {
  const hashedToken = hashToken(refreshToken);

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      user_id: userId,
      refresh_token: hashedToken,
      expires_at: expiresAt.toISOString(),
      user_agent: userAgent ?? null,
      ip: ip ?? null,
    })
    .select(sessionSelect)
    .single<SessionRow>();

  if (error) throw error;
  return mapSession(data);
};

export const getSessionByToken = async (refreshToken: string) => {
  const hashedToken = hashToken(refreshToken);

  const { data, error } = await supabase
    .from("sessions")
    .select(sessionSelect)
    .eq("refresh_token", hashedToken)
    .maybeSingle<SessionRow>();

  if (error) throw error;
  return data ? mapSession(data) : null;
};

export const deleteSessionByToken = async (refreshToken: string) => {
  const hashedToken = hashToken(refreshToken);
  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("refresh_token", hashedToken);

  if (error) throw error;
};

export const rotateSession = async (
  sessionId: string,
  refreshToken: string,
  expiresAt: Date,
  meta?: RotateSessionMeta
) => {
  const hashedToken = hashToken(refreshToken);

  const updates: Record<string, unknown> = {
    refresh_token: hashedToken,
    expires_at: expiresAt.toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (meta?.userAgent) updates.user_agent = meta.userAgent;
  if (meta?.ip) updates.ip = meta.ip;

  const { data, error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", sessionId)
    .select(sessionSelect)
    .maybeSingle<SessionRow>();

  if (error) throw error;
  return data ? mapSession(data) : null;
};
