import z from 'zod';
// Define the Zod schema fro error  handler option
export const ErrorHandlerOptionSchema=z.object({
    error:z.unknown(),// The caught error (can be any type)
    message:z.string().optional(),
    status:z.number().optional(),
    statusText:z.string().optional(),

})

// Infer the TypeScript from the Zod schema
export type ErrorHandlerOption=z.infer<typeof ErrorHandlerOptionSchema>;