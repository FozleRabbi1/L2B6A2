import express from 'express';
import { AuthController } from './auth.controller';

const router = express.Router();

router.post("/signup", AuthController.createUser);
router.post("/signin", AuthController.login)


export const AuthRouter = router;