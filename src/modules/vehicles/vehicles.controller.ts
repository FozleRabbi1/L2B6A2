import { Request, Response } from "express";
import { VehicleService } from "./vehicles.service";

const createVehicle = async (req: Request, res: Response) => {
    try {
        const result = await VehicleService.createVehicle(req.body);
        res.status(201).json({
            success: true,
            message: "Vehicle created successfully",
            data: result,
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

export const VehicleController = {
    createVehicle,
};

