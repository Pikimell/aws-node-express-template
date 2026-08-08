import { Router } from "express";
import * as authControllers from "../controllers/authController.js";
import {
  validateConfirmEmail,
  validateLogin,
  validateLogout,
  validateRefresh,
  validateRegister,
  validateResetConfirm,
  validateResetRequest,
} from "../validations/auth.js";

const router = Router();

router.post("/register", validateRegister, authControllers.registerUserController);

router.post("/login", validateLogin, authControllers.loginController);

router.post("/logout", validateLogout, authControllers.logoutController);

router.post("/refresh", validateRefresh, authControllers.refreshController);

router.post("/reset/request", validateResetRequest, authControllers.requestResetEmailController);

router.post("/reset/confirm", validateResetConfirm, authControllers.resetPasswordController);

router.post("/confirm", validateConfirmEmail, authControllers.confirmEmailController);

export default router;
