import * as authServices from "../services/authService.js";
import { ONE_DAY, ONE_MONTH } from "../helpers/constants.js";
export const registerUserController = async (req, res, next) => {
    try {
        const { email, password, group } = req.body;
        const result = await authServices.registerUserService({
            email,
            password,
            group,
        });
        res.status(201).json(result);
    }
    catch (err) {
        next(err);
    }
};
export const loginController = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const session = await authServices.loginService({ email, password });
        res.cookie("refreshToken", session.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: ONE_MONTH,
        });
        res.cookie("accessToken", session.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: ONE_DAY,
        });
        res.cookie("sessionId", session.idToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: ONE_DAY,
        });
        res.status(200).json({ accessToken: session.accessToken });
    }
    catch (err) {
        next(err);
    }
};
export const logoutController = async (_req, res, next) => {
    try {
        await authServices.logoutService();
        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");
        res.clearCookie("sessionId");
        res.status(200).json({ message: "Logged out successfully!" });
    }
    catch (err) {
        next(err);
    }
};
export const refreshController = async (_req, res, next) => {
    try {
        const session = await authServices.refreshService();
        res.cookie("refreshToken", session.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: ONE_MONTH,
        });
        res.cookie("accessToken", session.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: ONE_DAY,
        });
        res.cookie("sessionId", session.idToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: ONE_DAY,
        });
        res.status(200).json({ accessToken: session.accessToken });
    }
    catch (err) {
        next(err);
    }
};
export const requestResetEmailController = async (req, res, next) => {
    try {
        const { email } = req.body;
        await authServices.requestResetEmailService(email);
        res.status(200).json({ message: "Password reset email sent" });
    }
    catch (err) {
        next(err);
    }
};
export const resetPasswordController = async (req, res, next) => {
    try {
        const { email, code, newPassword } = req.body;
        await authServices.resetPasswordService({ email, code, newPassword });
        res.status(200).json({ message: "Password successfully reset" });
    }
    catch (err) {
        next(err);
    }
};
export const confirmEmailController = async (req, res, next) => {
    try {
        const { email, code } = req.body;
        await authServices.confirmEmailService({ email, code });
        res.status(200).json({ message: "Email confirmed successfully!" });
    }
    catch (err) {
        next(err);
    }
};
