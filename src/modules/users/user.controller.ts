import { Request, Response } from "express";
import { userService } from "./user.service";
import { JwtPayload } from "jsonwebtoken";



const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await userService.getUsers();
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const result = await userService.getUserById(req.params.id as string);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  const currentUserId = (req.user as JwtPayload).userId;
  if (currentUserId !== Number(req.params.userId) && (req.user as JwtPayload).role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to update this user",
    });
  }

  try {
    const result = await userService.updateUser(req.params.userId as string, req.body);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


const deleteUser = async (req: Request, res: Response) => {
  try {
    await userService.deleteUser(req.params.userId as string);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const userController = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
