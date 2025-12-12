// app/api/support-tickets/[id]/priority/route.ts
import { NextResponse, NextRequest } from 'next/server';
import supportTicketModel from '@/models/support.model';
import dbConnect from '@/utils/dbConnectionHandlers';
import { getServerSession } from 'next-auth';
import { authOption } from '@/app/api/auth/[...nextauth]/option';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  const session = await getServerSession(authOption);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { priority } = await request.json();
    const validPriorities = ['Low', 'Normal', 'High', 'Urgent'];
    
    if (!validPriorities.includes(priority)) {
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
    }

    const updatedTicket = await supportTicketModel.findByIdAndUpdate(
      params.id,
      { priority, updatedAt: new Date() },
      { new: true }
    ).populate('userId assignedTo');

    if (!updatedTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Priority update error:', error);
    return NextResponse.json(
      { error: 'Server error', details: error },
      { status: 500 }
    );
  }
}

// Optional: Handle other methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { 'Allow': 'PATCH' } }
  );
}