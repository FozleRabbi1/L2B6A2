import { Router } from "express";
import { Auth } from "../../middleware/Auth";
import { BookingController } from "./bookings.controller";

const router = Router();

router.post(
  "/",
  Auth(["admin", "customer"]),
  BookingController.createBooking
);

router.get(
  "/",
  Auth(["admin", "customer"]),
  BookingController.getBookings
);

router.put(
  "/:bookingId",
  Auth(["admin", "customer"]),
  BookingController.updateBooking
);

export const BookingRoutes = router;
