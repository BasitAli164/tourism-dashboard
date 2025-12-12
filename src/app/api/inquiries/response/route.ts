// app/api/inquiries/response/route.ts
import { NextResponse, NextRequest } from 'next/server';
import inqueryModel from '@/models/inquery.model';
import dbConnect from '@/utils/dbConnectionHandlers';
import { getServerSession } from 'next-auth';
import { authOption } from '@/app/api/auth/[...nextauth]/option';

export async function POST(request: NextRequest) {
  await dbConnect();
  
  const session = await getServerSession(authOption);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { message, inquiryId } = await request.json();
    
    // Validate inputs
    if (!inquiryId || !message?.trim()) {
      return NextResponse.json(
        { error: 'Inquiry ID and message are required' }, 
        { status: 400 }
      );
    }

    // Validate inquiry ID format
    if (!/^[0-9a-fA-F]{24}$/.test(inquiryId)) {
      return NextResponse.json(
        { error: 'Invalid inquiry ID format' },
        { status: 400 }
      );
    }

    const inquiry = await inqueryModel.findById(inquiryId);
    if (!inquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' }, 
        { status: 404 }
      );
    }

    const newResponse = {
      message: message.trim(),
      respondedBy: session.user._id, // Store the user ID from session
      respondedAt: new Date(),
    };

    // Initialize response array if it doesn't exist
    if (!inquiry.response) {
      inquiry.response = [];
    }

    inquiry.response.push(newResponse);
    inquiry.updatedAt = new Date();
    await inquiry.save();

    // Populate the respondedBy field with user details
    const populatedInquiry = await inqueryModel.findById(inquiryId)
    .populate('assignedTo')
    .populate('userId', 'name email') // Populate basic user info
    .populate('responses.respondedBy', 'name email'); // Populate responder info

    return NextResponse.json({
      success: true,
      inquiry: populatedInquiry
    });

  } catch (error) {
    console.error('Error adding response:', error);
    return NextResponse.json(
      { 
        error: 'Server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}