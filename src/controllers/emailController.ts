import { RequestHandler } from "express";

import * as emailService from "../services/emailService.js";

export const sendNotificationEmailController: RequestHandler = async (req, res, next) => {
  try {
    const { email, message } = req.body as { email: string; message: string };
    const result = await emailService.sendNotificationEmail(email, message);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const sendWelcomeEmailController: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body as { email: string };
    const result = await emailService.sendWelcomeEmail(email);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const sendLoginNotificationEmailController: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body as { email: string };
    const result = await emailService.sendLoginNotificationEmail(email);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
