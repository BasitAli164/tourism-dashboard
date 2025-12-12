import { NextResponse } from "next/server";
import feedbackModel from "@/models/feedback.model";
import dbConnect from "@/utils/dbConnectionHandlers";
import mongoose from "mongoose";

// GET all feedback
export async function GET() {
  try {
    await dbConnect();
    
    const feedback = await feedbackModel.find()
      .populate('user', 'name email') // Adjust fields as needed
      .populate('responses.respondedBy', 'name')
      .sort({ date: -1 });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { message: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
// POST: Add feedback
export async function POST(req: Request) {
  try {
    // Connect to DB
    await dbConnect();

    // Parse JSON body
    const body = await req.json();

    const {
      user,
      message,
      date, // optional: can be auto-generated
      status = "Pending",
      category = "General",
      responses = [], // optional: default to empty
    } = body;

    // Validate required fields
    if (!user || !message) {
      return NextResponse.json(
        { error: "User and message fields are required." },
        { status: 400 }
      );
    }

    // Create new feedback document
    const newFeedback = await feedbackModel.create({
      user: new mongoose.Types.ObjectId(user),
      message,
      date: date ? new Date(date) : undefined,
      status,
      category,
      responses, // if any responses provided
    });

    return NextResponse.json({ success: true, data: newFeedback }, { status: 201 });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      { error: "An error occurred while creating feedback." },
      { status: 500 }
    );
  }
}