import express from 'express';
import { VehicleController } from './vehicles.controller';
import { Auth } from '../../middleware/Auth';

const router = express.Router();

router.post("/", Auth(["admin"]), VehicleController.createVehicle);
router.get("/", VehicleController.getAllVehicles);

export const VehiclesRouter = router;