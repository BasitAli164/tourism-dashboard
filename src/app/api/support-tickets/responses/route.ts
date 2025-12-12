// app/api/support-tickets/response/route.ts
import { NextResponse, NextRequest } from 'next/server';
import supportTicketModel from '@/models/support.model';
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
    const { ticketId, message } = await request.json();
    
    // Validate inputs
    if (!ticketId || !message?.trim()) {
      return NextResponse.json(
        { error: 'Ticket ID and message are required' }, 
        { status: 400 }
      );
    }

    // Validate ticket ID format
    if (!/^[0-9a-fA-F]{24}$/.test(ticketId)) {
      return NextResponse.json(
        { error: 'Invalid ticket ID format' },
        { status: 400 }
      );
    }

    const ticket = await supportTicketModel.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' }, 
        { status: 404 }
      );
    }

    const newResponse = {
      message: message.trim(),
      respondedBy: session.user._id,
      respondedAt: new Date(),
    };

    ticket.response.push(newResponse);
    ticket.updatedAt = new Date();
    await ticket.save();

    const populatedTicket = await supportTicketModel.findById(ticketId)
      .populate('userId assignedTo')
      .populate('response.respondedBy', 'name');

    return NextResponse.json(populatedTicket);
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