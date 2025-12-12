// models/Booking.ts
import mongoose, { Document, Schema } from 'mongoose';

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid' | 'refunded';

export interface IBooking extends Document {
  packageName: string;
  packageId: string;
  date: Date;
  endDate: Date;
  person: number;
  name: string;
  email: string;
  phone: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  currency: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    packageName: { type: String, required: true },
    packageId: { type: String, required: true },
    date: { type: Date, required: true },
    endDate: { type: Date, required: true },
    person: { type: Number, required: true, min: 1 },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['confirmed', 'pending', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['paid', 'partial', 'unpaid', 'refunded'],
      default: 'unpaid',
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'USD' },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);