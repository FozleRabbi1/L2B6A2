import express from "express";
import { userController } from "./user.controller";
import { Auth } from "../../middleware/Auth";

const router = express.Router();

router.get("/", Auth(["admin"]), userController.getUsers);
router.get("/:id", userController.getUserById);
router.put("/:userId", Auth(["admin", "customer"]), userController.updateUser);
router.delete("/:userId", Auth(["admin"]), userController.deleteUser);

export const UserRouter = router;
