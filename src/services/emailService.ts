import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import createHttpError from "http-errors";

import { env } from "../utils/env.js";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const sesClient = new SESClient({
  region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION,
});

const fromEmail = () => env("SES_FROM_EMAIL");

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendEmail({ to, subject, text, html }: EmailPayload) {
  try {
    const result = await sesClient.send(
      new SendEmailCommand({
        Source: fromEmail(),
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Charset: "UTF-8",
            Data: subject,
          },
          Body: {
            Text: {
              Charset: "UTF-8",
              Data: text,
            },
            Html: {
              Charset: "UTF-8",
              Data: html,
            },
          },
        },
      })
    );

    return {
      message: "Email sent successfully",
      messageId: result.MessageId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    throw createHttpError(502, message);
  }
}

export async function sendNotificationEmail(to: string, message: string) {
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  return sendEmail({
    to,
    subject: "Notification",
    text: message,
    html: `<p>${safeMessage}</p>`,
  });
}

export async function sendWelcomeEmail(to: string) {
  return sendEmail({
    to,
    subject: "Welcome!",
    text: "Your registration was successful.",
    html: "<p>Your registration was successful.</p>",
  });
}

export async function sendLoginNotificationEmail(to: string) {
  return sendEmail({
    to,
    subject: "Account login notification",
    text: "A login to your account was performed.",
    html: "<p>A login to your account was performed.</p>",
  });
}
