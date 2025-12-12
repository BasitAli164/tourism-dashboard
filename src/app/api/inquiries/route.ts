import { NextResponse,NextRequest } from 'next/server';
import dbConnect from '@/utils/dbConnectionHandlers';
import inqueryModel from '@/models/inquery.model';

export const GET = async () => {
  try {
    await dbConnect();
    
    const inquiries = await inqueryModel
  .find()
  .populate("assignedTo", "name email")
  .sort({ createdAt: -1 })
  .lean();


    const formattedInquiries = inquiries.map(inqueryModel => ({
      id: inqueryModel._id,
      name: inqueryModel.name,
      email: inqueryModel.email,
      subject: inqueryModel.subject,
      date: inqueryModel.createdAt.toISOString().split('T')[0],
      status: inqueryModel.status,
      assignedTo: inqueryModel.assignedTo?.toString() || null,
    }));

    return NextResponse.json(formattedInquiries);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
};

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      name,
      email,
      phone,
      subject,
      message,
      status = "Pending",
      priority = "Normal",
      userId,
      assignedTo,
      responses = [],
    } = body;

    // Basic validation
    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newInquiry = await inqueryModel.create({
      name,
      email,
      phone,
      subject,
      message,
      status,
      priority,
      userId,
      assignedTo,
      responses,
    });

    return NextResponse.json(
      { message: "Inquiry submitted successfully", inquiry: newInquiry },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}