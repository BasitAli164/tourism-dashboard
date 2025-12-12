import { NextResponse } from "next/server";
import { ErrorHandlerOptionSchema, ErrorHandlerOption } from "@/schemas/errorSchema";
import { ZodError } from "zod";

/**
 * Centralized error handler function.
 */
export function errorHandler(options: ErrorHandlerOption = {}): NextResponse {
    try {
        // Validate the options object using Zod
        const validatedOptions = ErrorHandlerOptionSchema.parse(options);

        // Destructure validated options
        const {
            error,
            message = "Something went wrong",
            status = 500,
            statusText = "Internal Server Error",
        } = validatedOptions;

        // Log the error for debugging
        console.error("Error:", error);

        // Narrow the type of `error` before using `instanceof`
        if (error instanceof Error) {
            // Handle Zod validation errors
            if (error instanceof ZodError) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Validation Error",
                        error: error.errors, // Zod error details
                    },
                    {
                        status: 400,
                        statusText: "Bad Request",
                    }
                );
            }

            // Handle other Error instances
            return NextResponse.json(
                {
                    success: false,
                    message,
                    error: error.message, // Use the error message
                },
                {
                    status,
                    statusText,
                }
            );
        }

        // Handle non-Error types (e.g., strings, undefined, etc.)
        return NextResponse.json(
            {
                success: false,
                message,
                error: typeof error === "string" ? error : "Internal Server Error",
            },
            {
                status,
                statusText,
            }
        );
    } catch (error) {
        // Handle errors in the error handler itself (e.g., invalid options)
        console.error("Error in errorHandler:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
                error: "Failed to handle error 🧧",
            },
            {
                status: 500,
                statusText: "Internal Server Error",
            }
        );
    }
}