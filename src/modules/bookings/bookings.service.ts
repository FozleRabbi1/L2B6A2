import { pool } from "../../config/db";


const createBooking = async (payload: Record<string, unknown>) => {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

    const vehicle = await pool.query(
        `SELECT * FROM vehicles WHERE id = $1`,
        [vehicle_id]
    );

    if (vehicle.rows.length === 0) throw new Error("Vehicle not found");
    if (vehicle.rows[0].availability_status !== "available")
        throw new Error("Vehicle is not available");

    const dailyPrice = Number(vehicle.rows[0].daily_rent_price);

    const days =
        (new Date(rent_end_date as string).getTime() -
            new Date(rent_start_date as string).getTime()) /
        (1000 * 60 * 60 * 24);

    if (days <= 0) throw new Error("Invalid rent date range");

    const totalPrice = dailyPrice * days;

    const booking = await pool.query(
        `
            INSERT INTO bookings (
                customer_id,
                vehicle_id,
                rent_start_date,
                rent_end_date,
                total_price,
                status
            ) VALUES ($1, $2, $3, $4, $5, 'active')
            RETURNING *
        `,
        [customer_id, vehicle_id, rent_start_date, rent_end_date, totalPrice]
    );

    await pool.query(
        `UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`,
        [vehicle_id]
    );

    return {
        ...booking.rows[0],
        vehicle: {
            vehicle_name: vehicle.rows[0].vehicle_name,
            daily_rent_price: vehicle.rows[0].daily_rent_price
        }
    };
}

const getBookings = async (userId: number, role: string) => {
    if (role === "admin") {
        const result = await pool.query(`
                SELECT 
                    b.*,
                    json_build_object('name', u.name, 'email', u.email) AS customer,
                    json_build_object('vehicle_name', v.vehicle_name, 'registration_number', v.registration_number) AS vehicle
                FROM bookings b
                JOIN users u ON b.customer_id = u.id
                JOIN vehicles v ON b.vehicle_id = v.id
                ORDER BY b.id DESC
            `);
        return result.rows;
    }

    const result = await pool.query(
        `
            SELECT 
                b.id,
                b.vehicle_id,
                b.rent_start_date,
                b.rent_end_date,
                b.total_price,
                b.status,
                json_build_object(
                    'vehicle_name', v.vehicle_name,
                    'registration_number', v.registration_number,
                    'type', v.type
                ) AS vehicle
            FROM bookings b
            JOIN vehicles v ON b.vehicle_id = v.id
            WHERE customer_id = $1
            ORDER BY b.id DESC
        `,
        [userId]
    );

    return result.rows;
}

const updateBooking = async (
    bookingId: string,
    status: string,
    userId: number,
    role: string
) => {
    const id = Number(bookingId);
    if (isNaN(id)) throw new Error("Invalid booking ID");

    const booking = await pool.query(
        `SELECT * FROM bookings WHERE id = $1`,
        [id]
    );

    if (booking.rows.length === 0) throw new Error("Booking not found");

    const data = booking.rows[0];
    if (role === "customer") {
        if (data.customer_id !== userId)
            throw new Error("You are not allowed to modify this booking");

        if (status !== "cancelled")
            throw new Error("Customers can only cancel bookings");
    }

    if (role === "admin" && status === "returned") {
        await pool.query(
            `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
            [data.vehicle_id]
        );
    }

    const updated = await pool.query(
        `
            UPDATE bookings
            SET status = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *
        `,
        [status, id]
    );

    return updated.rows[0];
}


export const BookingService = {
    createBooking,
    getBookings,
    updateBooking
};

