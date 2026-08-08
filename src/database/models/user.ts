export type UserRole = "user" | "admin";

export type User = {
  _id: string;
  email: string;
  nickname: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicUser = Omit<User, "password">;
export type UserDocument = User;
