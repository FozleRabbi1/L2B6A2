import { pool } from "../../config/db";
import cron from "node-cron";

export type Role = "admin" | "customer";
type BookingStatus = "active" | "cancelled" | "returned";

const ALLOWED_STATUSES: BookingStatus[] = ["active", "cancelled", "returned"];

class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

const toUtcMidnight = (dateStr: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD");
  }
  return new Date(`${dateStr}T00:00:00.000Z`);
};

const calculateDays = (start: string, end: string) => {
  const startDate = toUtcMidnight(start);
  const endDate = toUtcMidnight(end);

  const diffMs = endDate.getTime() - startDate.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return days;
};

const createBooking = async (payload: Record<string, unknown>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  if (!customer_id || !vehicle_id || !rent_start_date || !rent_end_date) {
    throw new ApiError(400, "Missing required booking fields");
  }

  const customerId = Number(customer_id);
  const vehicleId = Number(vehicle_id);

  if (Number.isNaN(customerId) || Number.isNaN(vehicleId)) {
    throw new ApiError(400, "customer_id and vehicle_id must be numbers");
  }

  const start = String(rent_start_date);
  const end = String(rent_end_date);

  const days = calculateDays(start, end);
  if (days <= 0) throw new ApiError(400, "Invalid rent date range");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const vehicleRes = await client.query(
      `SELECT * FROM vehicles WHERE id = $1 FOR UPDATE`,
      [vehicleId]
    );

    if (vehicleRes.rows.length === 0) {
      throw new ApiError(404, "Vehicle not found");
    }

    const vehicle = vehicleRes.rows[0];

    if (vehicle.availability_status !== "available") {
      throw new ApiError(400, "Vehicle is not available");
    }

    const totalPrice = Number(vehicle.daily_rent_price) * days;

    const bookingRes = await client.query(
      `
        INSERT INTO bookings (
          customer_id,
          vehicle_id,
          rent_start_date,
          rent_end_date,
          total_price,
          status
        )
        VALUES ($1, $2, $3, $4, $5, 'active')
        RETURNING *
      `,
      [customerId, vehicleId, start, end, totalPrice]
    );

    await client.query(
      `UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`,
      [vehicleId]
    );

    await client.query("COMMIT");

    return {
      ...bookingRes.rows[0],
      vehicle: {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: vehicle.daily_rent_price,
      },
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getBookings = async (userId: number, role: Role) => {
  if (role === "admin") {
    const result = await pool.query(`
      SELECT 
        b.*,
        json_build_object(
          'name', u.name,
          'email', u.email
        ) AS customer,
        json_build_object(
          'vehicle_name', v.vehicle_name,
          'registration_number', v.registration_number
        ) AS vehicle
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
      WHERE b.customer_id = $1
      ORDER BY b.id DESC
    `,
    [userId]
  );

  return result.rows;
};

const updateBooking = async (
  bookingId: string,
  status: string,
  userId: number,
  role: Role
) => {
  const id = Number(bookingId);
  if (Number.isNaN(id)) throw new ApiError(400, "Invalid booking ID");

  if (!ALLOWED_STATUSES.includes(status as BookingStatus)) {
    throw new ApiError(400, `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}`);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const bookingRes = await client.query(
      `SELECT * FROM bookings WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (bookingRes.rows.length === 0) {
      throw new ApiError(404, "Booking not found");
    }

    const booking = bookingRes.rows[0];

    if (booking.status !== "active") {
      throw new ApiError(400, "Only active bookings can be updated");
    }

    if (role === "customer") {
      if (booking.customer_id !== userId) {
        throw new ApiError(403, "You are not allowed to modify this booking");
      }
      if (status !== "cancelled") {
        throw new ApiError(403, "Customers can only cancel bookings");
      }
    }

    if (role === "admin") {
    }

    const updatedRes = await client.query(
      `
        UPDATE bookings
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `,
      [status, id]
    );

    let vehicleAvailability: "available" | "booked" | undefined;

    if (status === "returned" || status === "cancelled") {
      await client.query(
        `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
        [booking.vehicle_id]
      );
      vehicleAvailability = "available";
    }

    await client.query("COMMIT");

    const updated = updatedRes.rows[0];
    if (vehicleAvailability) {
      return {
        ...updated,
        vehicle: { availability_status: vehicleAvailability },
      };
    }
    return updated;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const autoReturnExpiredBookings = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const expired = await client.query(`
      SELECT * FROM bookings
      WHERE status = 'active'
      AND rent_end_date < CURRENT_DATE
      FOR UPDATE
    `);

    for (const booking of expired.rows) {
      await client.query(
        `UPDATE bookings SET status = 'returned', updated_at = NOW() WHERE id = $1`,
        [booking.id]
      );

      await client.query(
        `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
        [booking.vehicle_id]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

cron.schedule(
  "0 0 * * *",
  async () => {
    try {
      await autoReturnExpiredBookings();
      console.log("Auto-return executed successfully");
    } catch (err) {
      console.error("Auto-return failed:", err);
    }
  },
  { timezone: "Asia/Dhaka" }
);

export const BookingService = {
  createBooking,
  getBookings,
  updateBooking,
};
