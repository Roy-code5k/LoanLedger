import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { AppError } from "./error.middleware";

export interface AuthenticatedUser {
  id: string;
  phone: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateUser = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new AppError(
        "Authentication required. Please provide a valid Bearer token.",
        401,
        "UNAUTHORIZED"
      )
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, config.jwtSecret) as {
      sub: string;
      phone: string;
    };

    if (!payload.sub) {
      return next(new AppError("Invalid authentication token.", 401, "INVALID_TOKEN"));
    }

    req.user = {
      id: payload.sub,
      phone: payload.phone,
    };

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Session expired. Please log in again.", 401, "TOKEN_EXPIRED"));
    }
    return next(new AppError("Invalid or corrupted token.", 401, "INVALID_TOKEN"));
  }
};
