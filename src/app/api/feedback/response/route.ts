import { NextResponse } from "next/server";
import feedbackModel from "@/models/feedback.model";
import dbConnect from "@/utils/dbConnectionHandlers";
import { Types } from "mongoose";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { feedbackId, message, respondedBy } = await request.json();

    if (!Types.ObjectId.isValid(feedbackId)) {
      return NextResponse.json(
        { message: "Invalid feedback ID" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(respondedBy)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { message: "Response message is required" },
        { status: 400 }
      );
    }

    const feedback = await feedbackModel.findByIdAndUpdate(
      feedbackId,
      {
        $push: {
          responses: {
            message,
            respondedBy: new Types.ObjectId(respondedBy),
          },
        },
      },
      { new: true }
    )
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
    console.error("Error adding response:", error);
    return NextResponse.json(
      { message: "Failed to add response" },
      { status: 500 }
    );
  }
}