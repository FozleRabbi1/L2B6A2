import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";

export const Auth = (requiredRole?: string[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {            
            const token = req.headers.authorization?.split(" ")[1];            

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: "Authorization token missing",
                });
            }
            const decoded = await jwt.verify(token, config.jwt_secret as string) as JwtPayload;
            if (decoded.role && requiredRole && !requiredRole.includes(decoded.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Access forbidden: insufficient permissions",
                });
            }
            req.user = decoded;
            next();
        } catch (error: any) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
                error: error.message,
            });
        }
    };
