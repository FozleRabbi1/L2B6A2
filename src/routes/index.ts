import express from 'express';
import { AuthRouter } from '../modules/auth/auth.router';
const router = express.Router();

const moduleRoutes = [
    { path: '/auth', route: AuthRouter },
];

moduleRoutes.forEach((pathRouter) =>
    router.use(pathRouter.path, pathRouter.route),
);

export default router;
