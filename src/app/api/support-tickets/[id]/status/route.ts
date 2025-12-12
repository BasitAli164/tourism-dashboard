// app/api/support-tickets/[id]/status/route.ts
import { NextResponse, NextRequest } from 'next/server';
import supportTicketModel from '@/models/support.model';
import dbConnect from '@/utils/dbConnectionHandlers';
import { getServerSession } from 'next-auth';
import { authOption } from '@/app/api/auth/[...nextauth]/option';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } } // Sync parameter destructuring
) {
  // IMMEDIATE sync access to params
  const ticketId = params.id; // Must be first operation
  
  try {
    await dbConnect();
    
    const session = await getServerSession(authOption);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    const validStatus = ['Pending', 'In_Progress', 'Resolved', 'Closed'];
    
    if (!validStatus.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedTicket = await supportTicketModel.findByIdAndUpdate(
      ticketId, // Use sync-accessed parameter
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('userId assignedTo');

    return updatedTicket 
      ? NextResponse.json(updatedTicket)
      : NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { 'Allow': 'PATCH' } }
  );
}