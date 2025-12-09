import jwt from "jsonwebtoken";
import type { Request } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "vu-portal-jwt-secret-change-in-production";
const JWT_EXPIRES_IN = "7d"; // Token valid for 7 days

export interface JWTPayload {
    userId: number;
    iat?: number;
    exp?: number;
}

/**
 * Sign a JWT token for a user
 */
export function signToken(userId: number): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        return null;
    }
}

/**
 * Extract user ID from Authorization header
 * Expected format: "Bearer <token>"
 */
export function getAuthUserId(req: Request): number | null {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const payload = verifyToken(token);

    return payload?.userId ?? null;
}

/**
 * Middleware to require authentication
 */
export function requireAuth(req: any, res: any, next: any) {
    const userId = getAuthUserId(req);

    if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    // Attach userId to request for use in route handlers
    req.userId = userId;
    next();
}
