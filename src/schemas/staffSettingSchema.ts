import { z } from "zod";

export const StaffSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["Admin", "Support", "Manager", "TourGuide", "Agent", "ContentCreator", "Traveler"]),
  phone: z.string().optional(),
  address: z.string().optional(),
  department: z.string().optional(),
  joiningDate: z.string().optional(),
  notes: z.string().optional(),
});

export type Staff = z.infer<typeof StaffSchema>;