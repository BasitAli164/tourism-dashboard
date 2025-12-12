import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnectionHandlers";
import Tour from "@/models/tour.model";
import { errorHandler } from "@/utils/errorHandler";
import mongoose from "mongoose";
// Prevent static generation of route (force dynamic)
export const dynamic = "force-dynamic";
// Enforce Node.js runtime instead of Edge runtime
export const runtime = "nodejs";
interface UpdateBody {
  images?: unknown[];
  relatedTours?: unknown;
  title?: string;
  description?: string;
  // Add other expected fields from your schema
}


// =================== Get Single Tour Detail ===================

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Explicitly ensure that params is awaited
    const { id } = await context.params;  // <-- Explicitly await params

    const getTour = await Tour.findById(id);

    if (!getTour) {
      return NextResponse.json(
        { error: "Tour not found" },
        { status: 404, statusText: "Not found" }
      );
    }

    return NextResponse.json(getTour, {
      status: 200,
      statusText: "OK",
    });
  } catch (error) {
    console.error("Tour fetching error:", error);
    return errorHandler({
      error,
      message: `Failed to get tour with ID: ${context.params.id}`,
      status: 500,
      statusText: "Internal Server Error",
    });
  }
}
// =================== Update Single Tour Detail ===================

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Explicitly await params if they are promises
    const { id } = await params; // Await params here

    // Type the incoming request body
    const body = await req.json() as UpdateBody;

    // Sanitize and validate images with proper typing
    let { images = [], ...rest } = body;
    if (!Array.isArray(images)) {
      images = [];
    }
    const sanitizedImages = images.filter((img: unknown): img is string => {
      return typeof img === 'string';
    });

    // Validate relatedTours with type safety
    let rawRelatedTours = body.relatedTours ?? [];
    let relatedTours: string[] = [];
    
    if (typeof rawRelatedTours === 'string') {
      relatedTours = rawRelatedTours.split(',').map(id => id.trim());
    } else if (Array.isArray(rawRelatedTours)) {
      relatedTours = rawRelatedTours.filter(id => typeof id === 'string');
    }

    // Convert to valid ObjectIDs
    const validRelatedTours = relatedTours
      .map((id: string) => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch {
          return null;
        }
      })
      .filter((id): id is mongoose.Types.ObjectId => id !== null);

    // Prepare update data with proper types
    const updateData = {
      ...rest,
      images: sanitizedImages,
      relatedTours: validRelatedTours
    };

    // Perform update with validation
    const updatedTour = await Tour.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTour) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Tour updated', tour: updatedTour },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update error:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// =================== Delete Single Tour Detail ===================

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } } // 📦 Extract dynamic route param `id`
) {
  try {
    // 🔌 Connect to MongoDB
    await dbConnect();
    // 🗑️ Try to find and delete the tour by ID
    let deleteTour = await Tour.findByIdAndDelete(params.id);
    // ❗ If no tour found with the given ID, return 404
    if (!deleteTour) {
      return NextResponse.json(
        { error: "Tour not found" },
        { status: 404, statusText: "Not found" }
      );
    }
    // ✅ Tour deleted successfully, send confirmation response
    return NextResponse.json(
      {
        message: `Tour deleted successfully with ID: ${params.id}`,
      },
      {
        status: 200,
        statusText: "Ok",
      }
    );
  } catch (error) {
    // ❌ Catch and handle any errors during deletion

    console.error("Tour deleting error: ", error);
    return errorHandler({
      error, // ✅ ES6 shorthand for error: error
      message: "Failed to delete tour",
      status: 500,
      statusText: "Internal Server Error",
    });
  }
}
