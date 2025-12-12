import { BookingStatus, PaymentStatus } from "@/models/booking.model";

export interface NotificationBase {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}

export interface SupportTicketNotification extends NotificationBase {
  type: 'SUPPORT_TICKET';
  metadata: {
    ticketId: string;
    priority: string;
    status: string;
  };
}

export interface InquiryNotification extends NotificationBase {
  type: 'INQUIRY';
  metadata: {
    inquiryId: string;
    subject: string;
    userEmail: string;
  };
}

export interface BookingNotification extends NotificationBase {
  type: 'BOOKING';
  metadata: {
    bookingId: string;
    packageName: string;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    amount: number;
  };
}

export interface FeedbackNotification extends NotificationBase {
  type: 'FEEDBACK';
  metadata: {
    feedbackId: string;
    category: string;
    status: string;
  };
}

export type Notification = 
  | SupportTicketNotification 
  | InquiryNotification 
  | BookingNotification 
  | FeedbackNotification;

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  success: boolean;
  error?: string;
} 