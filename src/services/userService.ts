import { query } from "../database/postgres.js";
import type { User, UserDocument, UserRole } from "../database/models/user.js";

export type CreateUserInput = {
  email: string;
  password: string;
  nickname: string;
  role: UserRole;
};

type UserRow = {
  _id: string;
  email: string;
  nickname: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export const createUser = async (userData: CreateUserInput): Promise<User> => {
  const result = await query<UserRow>(
    `
      insert into users (email, password, nickname, role)
      values ($1, $2, $3, $4)
      returning
        id as "_id",
        email,
        nickname,
        password,
        role,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `,
    [userData.email, userData.password, userData.nickname, userData.role]
  );

  return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await query<UserRow>(
    `
      select
        id as "_id",
        email,
        nickname,
        password,
        role,
        created_at as "createdAt",
        updated_at as "updatedAt"
      from users
      where email = $1
      limit 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
};

export const getUserByEmail = async (email: string): Promise<UserDocument> => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const getUserById = async (id: string): Promise<UserDocument> => {
  const result = await query<UserRow>(
    `
      select
        id as "_id",
        email,
        nickname,
        password,
        role,
        created_at as "createdAt",
        updated_at as "updatedAt"
      from users
      where id = $1
      limit 1
    `,
    [id]
  );
  const user = result.rows[0];

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
