import { Request, Response } from "express";
import { AuthService } from "./auth.service";


const createUser = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


const login = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.login(req.body);
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token: result.token,
                user: result.data
            },
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};


export const AuthController = {
    createUser,
    login,
};
