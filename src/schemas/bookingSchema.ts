// src/schemas/bookingSchema.ts
import { z } from "zod";

export const BookingStatus = z.enum(["confirmed", "pending", "cancelled"]);
export type BookingStatus = z.infer<typeof BookingStatus>;

export const PaymentStatus = z.enum(["paid", "partial", "unpaid", "refunded"]);
export type PaymentStatus = z.infer<typeof PaymentStatus>;

export const BookingSchema = z.object({
  id: z.string(),
  packageName: z.string().min(1, "Package name is required"),
  packageId: z.string().min(1, "Package ID is required"),
  date: z.string().datetime({ offset: true }), // ISO 8601 datetime string
  endDate: z.string().datetime({ offset: true }), // ISO 8601 datetime string
  person: z.number().int().positive("Must be at least 1 person"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  status: BookingStatus,
  paymentStatus: PaymentStatus,
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3, "Currency must be 3 characters"),
  notes: z.string().optional(),
  createdAt: z.string().datetime({ offset: true }), // ISO 8601 datetime string
});

export type Booking = z.infer<typeof BookingSchema>;

// Optional: Create schemas for API request/response if needed
export const CreateBookingSchema = BookingSchema.omit({ 
  id: true, 
  createdAt: true 
});

export const UpdateBookingSchema = BookingSchema.partial().required({ 
  id: true 
});

export const BookingResponseSchema = z.object({
  success: z.boolean(),
  data: BookingSchema,
});

export const BookingsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(BookingSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

// Status update schema
export const BookingStatusUpdateSchema = z.object({
  status: BookingStatus,
});

// Payment status update schema
export const PaymentStatusUpdateSchema = z.object({
  paymentStatus: PaymentStatus,
});

// Message schema
export const BookingMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
});