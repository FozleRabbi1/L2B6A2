import { pool } from "../../config/db";

const createVehicle = async (payload: Record<string, unknown>) => {
    const {
        vehicle_name,
        type,
        registration_number,
        daily_rent_price,
        availability_status
    } = payload;

    const result = await pool.query(
        `INSERT INTO vehicles(
        vehicle_name,
        type,
        registration_number,
        daily_rent_price,
        availability_status
     )
     VALUES($1, $2, $3, $4, $5)
     RETURNING *`,
        [
            vehicle_name,
            type,
            registration_number,
            daily_rent_price,
            availability_status
        ]
    );

    return result.rows[0];
};

const getAllVehicles = async () => {
    const result = await pool.query(`SELECT * FROM vehicles`);

    if (result.rows.length > 0) {
        return {
            message: "Vehicles retrieved successfully",
            data: result.rows
        }
    }
    return {
        message: "No vehicles found",
        data: []
    };
};


export const VehicleService = {
    createVehicle,
    getAllVehicles,
};