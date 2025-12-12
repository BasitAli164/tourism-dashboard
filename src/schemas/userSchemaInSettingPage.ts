// userSchema.ts
import { z } from "zod";

// Define the Zod schema for User
export const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["Admin", "Support"]), // Use enum for specific roles
});

// Infer the TypeScript type from the schema
export type User = z.infer<typeof UserSchema>;