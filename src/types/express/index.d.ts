import type { UserDocument } from "../../database/models/user.js";

declare global {
  namespace Express {
    // Augment the request with authenticated user context
    interface Request {
      user?: UserDocument;
      typeAccount?: string | null;
    }
  }
}

export {};
