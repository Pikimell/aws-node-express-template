import { model, Schema } from "mongoose";
const userSchema = new Schema({
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
    password: {
        type: String,
        required: true,
    },
}, {
    versionKey: false,
});
userSchema.methods.toJSON = function () {
    const { password, ...rest } = this.toObject();
    return rest;
};
export const UserCollection = model("users", userSchema);
