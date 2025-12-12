import { NextResponse } from "next/server";
import feedbackModel from "@/models/feedback.model";
import dbConnect from "@/utils/dbConnectionHandlers";
import { Types } from "mongoose";

// GET single feedback by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: "Invalid feedback ID" },
        { status: 400 }
      );
    }

    const feedback = await feedbackModel.findById(params.id)
      .populate('user', 'name email')
      .populate('responses.respondedBy', 'name');

    if (!feedback) {
      return NextResponse.json(
        { message: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { message: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

// UPDATE feedback status
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid feedback ID" },
        { status: 400 }
      );
    }

    const { status } = await request.json();

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status value" },
        { status: 400 }
      );
    }

    const updatedFeedback = await feedbackModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
    .populate('user', 'name email')
    .populate('responses.respondedBy', 'name');

    if (!updatedFeedback) {
      return NextResponse.json(
        { message: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedFeedback);
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { message: "Failed to update feedback" },
      { status: 500 }
    );
  }
}


// DELETE feedback
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: "Invalid feedback ID" },
        { status: 400 }
      );
    }

    const deletedFeedback = await feedbackModel.findByIdAndDelete(params.id);

    if (!deletedFeedback) {
      return NextResponse.json(
        { message: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Feedback deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json(
      { message: "Failed to delete feedback" },
      { status: 500 }
    );
  }
}