import { celebrate } from "celebrate";
import { Router } from "express";

import * as emailControllers from "../controllers/emailController.js";
import { notificationEmailSchema, recipientEmailSchema } from "../validations/email.js";

const router = Router();

router.post(
  "/notification",
  celebrate(notificationEmailSchema),
  emailControllers.sendNotificationEmailController
);

router.post(
  "/welcome",
  celebrate(recipientEmailSchema),
  emailControllers.sendWelcomeEmailController
);

router.post(
  "/login",
  celebrate(recipientEmailSchema),
  emailControllers.sendLoginNotificationEmailController
);

export default router;
