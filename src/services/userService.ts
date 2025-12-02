import { UserCollection, type User, type UserDocument } from "../database/models/user.js";

export const createUser = (userData: User) => {
  return UserCollection.create(userData);
};

export const getUserByCognito = async (cognitoSub: string): Promise<UserDocument> => {
  const user = await UserCollection.findOne({ cognitoSub });

  if (!user) {
    throw new Error("User not found!");
  }

  return user;
};
