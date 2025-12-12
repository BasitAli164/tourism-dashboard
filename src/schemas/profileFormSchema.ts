import * as z from "zod";

// Profile Update Schema
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters long.",
    })
    .optional(), // Optional for partial updates
  email: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    })
    .optional(), // Optional for partial updates
  password: z
    .preprocess(
      (val) => {
        if (typeof val === "string" && val.trim() === "") {
          // Convert empty string to undefined so that password isn't validated
          return undefined;
        }
        return val;
      },
      z.string().min(8, {
        message: "Password must be at least 8 characters long.",
      }).optional()
    ),
  avatar: z
    .instanceof(File, {
      message: "Please upload a valid image file.",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size must be less than 5MB.",
    }) // Limit file size to 5MB
    .refine((file) => file.type.startsWith("image/"), {
      message: "Only image files are allowed.",
    }) // Ensure the file is an image
    .optional(), // Optional field
});

// Define TypeScript type for form values
export type ProfileFormValues = z.infer<typeof profileUpdateSchema>;
