// schemas.ts
import { z } from "zod";

// Schema for TourTypes
export const TourSchema = z.object({
  _id: z.string(),
  title: z.string().min(1, "Title is required"),
  location: z.string().min(1, "Location is required"),
  price: z.number().min(0, "Price must be a positive number"),
  duration: z.number().min(1, "Duration must be at least 1 day"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["Draft", "Published", "Archived"]),
  category: z.string().min(1, "Category is required"),
});

// Schema for SortOption
export const SortOptionSchema = z.enum(["title", "price", "duration"]);

// Infer TypeScript types from Zod schemas
export type TourTypes = z.infer<typeof TourSchema>;
export type SortOption = z.infer<typeof SortOptionSchema>;