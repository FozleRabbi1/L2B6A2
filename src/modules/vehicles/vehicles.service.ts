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

const getSingleVehicle = async (vehicleId: string) => {
    const result = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [vehicleId]);
    return result.rows[0];
};

const updateSingleVehicle = async (vehicleId: string, payload: Record<string, unknown>) => {
    const id = Number(vehicleId);
    if (isNaN(id)) throw new Error("Invalid vehicle ID");

    const check = await pool.query("SELECT * FROM vehicles WHERE id = $1", [id]);
    if (check.rows.length === 0) throw new Error("Vehicle not found");

    const allowed = [
        "vehicle_name",
        "type",
        "registration_number",
        "daily_rent_price",
        "availability_status"
    ];

    const entries = Object.entries(payload).filter(([key]) => allowed.includes(key));
    if (entries.length === 0) throw new Error("No valid fields provided for update");

    const setQuery = entries.map(([key], i) => `${key} = $${i + 1}`).join(", ");
    const values = entries.map(([, value]) => value);

    const query = `
        UPDATE vehicles
        SET ${setQuery}, updated_at = NOW()
        WHERE id = $${entries.length + 1}
        RETURNING *
    `;

    const result = await pool.query(query, [...values, id]);
    return result.rows[0];
};


const deleteSingleVehicleByAdmin = async (vehicleId: string) => {
    const result = await pool.query(`DELETE FROM vehicles WHERE id = $1 RETURNING *`, [vehicleId]);
    return result.rows[0];
};



export const VehicleService = {
    createVehicle,
    getAllVehicles,
    getSingleVehicle,
    updateSingleVehicle,
    deleteSingleVehicleByAdmin
};