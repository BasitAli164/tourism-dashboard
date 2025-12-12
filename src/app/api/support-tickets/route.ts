import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnectionHandlers';
import SupportTicketModel from '@/models/support.model';
import User from '@/models/user.model'; // Import User model explicitly

export async function GET() {
  try {
    await dbConnect();

    // Explicitly populate both user and assignedTo fields
    const tickets = await SupportTicketModel.find({})
      .populate({
        path: 'userId',
        select: 'name email',
        model: User // Explicit model reference
      })
      .populate({
        path: 'assignedTo',
        select: 'name',
        model: User
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { message: 'Error fetching tickets', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}