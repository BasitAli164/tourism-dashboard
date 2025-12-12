// schemas/notificationSchema.ts
import { z } from "zod";

export const notificationSchema = z.object({
  id: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters long"),
  message: z.string().min(5, "Message must be at least 5 characters long"),
  time: z.string(), // You can format this as needed
  read: z.boolean(),
});

export type Notification = z.infer<typeof notificationSchema>;
