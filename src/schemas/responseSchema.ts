import { error } from 'console';
import z from 'zod';

export const ResponseOptionSchema=z.object({
    data:z.any().optional(), // Optional field of any type
    error:z.string().optional(), // Optional String
    message:z.string().optional(),// Optional String
    status:z.number().optional(), // Optional Number
    statusText:z.string().optional(),// Optional String
})

// Infer the TypeScript type from the Zod schema
export type ResponseOptions=z.infer<typeof ResponseOptionSchema>