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

const getAllVehicles = async (req: Request, res: Response) => {
    try {
        const result = await VehicleService.getAllVehicles();
        res.status(200).json({
            success: true,
            message: result.message,
            data: result.data,
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

const getSingleVehicle = async (req: Request, res: Response) => {
    try {
        const result = await VehicleService.getSingleVehicle(req.params.vehicleId as string);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Vehicle retrieved successfully",
            data: result,
        });
    }
    catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};


const updateSingleVehicle = async (req: Request, res: Response) => {
    const payload = req.body;
    try {
        const result = await VehicleService.updateSingleVehicle(req.params.vehicleId as string, payload);
        console.log(result);
        
        res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
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
    getAllVehicles,
    getSingleVehicle,
    updateSingleVehicle
};

