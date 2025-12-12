// inquiriesSchema.ts
import { z } from "zod";

export const InquiriesSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  date: z.string().datetime({ message: "Invalid date format" }), // More specific validation
  status: z.enum(["Pending", "In_Progress", "Resolved","Closed"]), // Added missing "Resolved"
  assignedTo: z.string().nullable().optional(), // Made optional for better compatibility
});

export type Inquiries = z.infer<typeof InquiriesSchema>;