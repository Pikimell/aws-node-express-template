import { celebrate } from 'celebrate';
import { Router } from 'express';
import * as authControllers from '../controllers/authController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { loginUserSchema, registerUserSchema } from '../validations/auth.js';

const router = Router();

router.post(
  '/auth/register',
  celebrate(registerUserSchema),
  authControllers.registerUserController,
);

router.post(
  '/auth/login',
  celebrate(loginUserSchema),
  authControllers.loginController,
);

router.post('/auth/logout', authControllers.logoutController);

router.post('/auth/refresh', authControllers.refreshController);

router.get('/auth/me', authenticate, authControllers.getCurrentUserController);

export default router;
