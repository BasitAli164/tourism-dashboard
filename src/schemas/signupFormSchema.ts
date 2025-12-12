import * as z from "zod";
export const signupFormSchema = z
  .object({
    name: z.string().min(5, {
      message: "Name must be at least 5 characters long.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters long.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
  
  // Define TypeScript type for form values
  export type FormValues = z.infer<typeof signupFormSchema>;
  