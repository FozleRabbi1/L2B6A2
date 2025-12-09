import { Request, Response } from "express";
import { BookingService } from "./bookings.service";

export const BookingController = {

    createBooking: async (req: Request, res: Response) => {
        try {
            const result = await BookingService.createBooking(req.body);
            res.status(201).json({
                success: true,
                message: "Booking created successfully",
                data: result
            });
        } catch (err: any) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    getBookings: async (req: Request, res: Response) => {
        try {
            const { id, role } = req.user as { id: number; role: string };

            const result = await BookingService.getBookings(id, role);

            res.status(200).json({
                success: true,
                message: role === "admin"
                    ? "Bookings retrieved successfully"
                    : "Your bookings retrieved successfully",
                data: result
            });
        } catch (err: any) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    updateBooking: async (req: Request, res: Response) => {
        try {
            const { bookingId } = req.params;
            const { status } = req.body;
            const { id, role } = req.user as { id: number; role: string };

            const result = await BookingService.updateBooking(bookingId as string, status, id, role);

            res.status(200).json({
                success: true,
                message:
                    status === "cancelled"
                        ? "Booking cancelled successfully"
                        : "Booking marked as returned. Vehicle is now available",
                data: result
            });
        } catch (err: any) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    
};
