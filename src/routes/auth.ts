import { celebrate } from "celebrate";
import { Router } from "express";
import * as authControllers from "../controllers/authController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { loginUserSchema, registerUserSchema } from "../validations/auth.js";

const router = Router();

router.post("/register", celebrate(registerUserSchema), authControllers.registerUserController);

router.post("/login", celebrate(loginUserSchema), authControllers.loginController);

router.post("/logout", authControllers.logoutController);

router.post("/refresh", authControllers.refreshController);

router.get("/me", authenticate, authControllers.getCurrentUserController);

export default router;
