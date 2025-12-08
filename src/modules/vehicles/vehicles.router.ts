import express from 'express';
import { VehicleController } from './vehicles.controller';
import { Auth } from '../../middleware/Auth';

const router = express.Router();

router.post("/", Auth(["admin"]), VehicleController.createVehicle);
router.get("/", VehicleController.getAllVehicles);
router.get("/:vehicleId", VehicleController.getSingleVehicle);
router.put("/:vehicleId", Auth(["admin"]), VehicleController.updateSingleVehicle);
router.delete("/:vehicleId", Auth(["admin"]), VehicleController.deleteSingleVehicleByAdmin);

export const VehiclesRouter = router;