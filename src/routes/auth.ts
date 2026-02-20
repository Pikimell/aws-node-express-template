import { Router } from "express";
import * as authControllers from "../controllers/authController.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.post("/register", authControllers.registerUserController);

router.post("/login", authControllers.loginController);

router.post("/logout", authControllers.logoutController);

router.post("/refresh", authControllers.refreshController);

router.get("/me", authenticate, authControllers.getCurrentUserController);

export default router;
