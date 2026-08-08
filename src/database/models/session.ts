export type Session = {
  _id: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  userAgent?: string | null;
  ip?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SessionDocument = Session;
