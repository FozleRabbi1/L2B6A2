import express from 'express';
import { AuthRouter } from '../modules/auth/auth.router';
import { VehiclesRouter } from '../modules/vehicles/vehicles.router';
import { UserRouter } from '../modules/users/user.routes';
import { BookingRoutes } from '../modules/bookings/bookings.router';
const router = express.Router();

const moduleRoutes = [
    { path: '/auth', route: AuthRouter },
    { path: '/users', route: UserRouter },
    { path: '/vehicles', route: VehiclesRouter },
    { path: '/bookings', route: BookingRoutes },
];

moduleRoutes.forEach((pathRouter) =>
    router.use(pathRouter.path, pathRouter.route),
);

export default router;
