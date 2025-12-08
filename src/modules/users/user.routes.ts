import express from "express";
import { userController } from "./user.controller";
import { Auth } from "../../middleware/Auth";

const router = express.Router();

router.get("/", Auth(["admin", "user"]), userController.getUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export const UserRouter = router;
