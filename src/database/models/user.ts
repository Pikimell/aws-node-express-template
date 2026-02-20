import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    nickname: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;

userSchema.methods.toJSON = function (this: UserDocument) {
  const { password, ...rest } = this.toObject();
  return rest;
};

export const UserCollection = model<User>("users", userSchema);
