import { supabase } from "../database/supabase.js";
import type { User, UserDocument, UserRole } from "../database/models/user.js";

export type CreateUserInput = {
  email: string;
  password: string;
  nickname: string;
  role: UserRole;
};

type UserRow = {
  id: string;
  email: string;
  nickname: string;
  password: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

const mapUser = (row: UserRow): User => ({
  _id: row.id,
  email: row.email,
  nickname: row.nickname,
  password: row.password,
  role: row.role,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

export const createUser = async (userData: CreateUserInput): Promise<User> => {
  const { data, error } = await supabase
    .from("users")
    .insert({
      email: userData.email,
      password: userData.password,
      nickname: userData.nickname,
      role: userData.role,
    })
    .select("id,email,nickname,password,role,created_at,updated_at")
    .single<UserRow>();

  if (error) throw error;
  return mapUser(data);
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("id,email,nickname,password,role,created_at,updated_at")
    .eq("email", email)
    .maybeSingle<UserRow>();

  if (error) throw error;
  return data ? mapUser(data) : null;
};

export const getUserByEmail = async (email: string): Promise<UserDocument> => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const getUserById = async (id: string): Promise<UserDocument> => {
  const { data, error } = await supabase
    .from("users")
    .select("id,email,nickname,password,role,created_at,updated_at")
    .eq("id", id)
    .maybeSingle<UserRow>();

  if (error) throw error;

  if (!data) {
    throw new Error("User not found");
  }

  return mapUser(data);
};
