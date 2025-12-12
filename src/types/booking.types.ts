// Define the status types
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid' | 'refunded';

// Define the main Booking interface
export interface Booking {
  id: string;
  packageName: string;
  packageId: string;
  date: string;
  endDate: string;
  person: number;
  name: string;
  email: string;
  phone: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Define filter types
export interface BookingFilters {
  search?: string;
  status?: string;
  sortBy?: string;
}

// Define summary types
export interface BookingSummary {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  totalRevenue: number;
} 