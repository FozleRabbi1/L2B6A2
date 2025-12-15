import { Request, Response } from "express";
import { BookingService, Role } from "./bookings.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    const result = await BookingService.createBooking(req.body);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: result
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

const getBookings = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.user as {
      userId: number;
      role: string;
    };

    const result = await BookingService.getBookings(userId, role as Role);

    res.status(200).json({
      success: true,
      message:
        role === "admin"
          ? "Bookings retrieved successfully"
          : "Your bookings retrieved successfully",
      data: result
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const { userId, role } = req.user as {
      userId: number;
      role: string;
    };

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    const result = await BookingService.updateBooking(
      bookingId as string,
      status,
      userId,
      role as Role
    );

    res.status(200).json({
      success: true,
      message:
        status === "cancelled"
          ? "Booking cancelled successfully"
          : "Booking marked as returned. Vehicle is now available",
      data: result
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const BookingController = {
  createBooking,
  getBookings,
  updateBooking
};
