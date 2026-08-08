import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    cognitoSub: {
      type: String,
      required: true,
      unique: true,
    },
    nickname: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    versionKey: false,
  }
);

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;

userSchema.methods.toJSON = function (this: UserDocument) {
  return this.toObject();
};

export const UserCollection = model<User>("users", userSchema);
