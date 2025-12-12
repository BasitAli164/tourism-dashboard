// app/api/support-tickets/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import supportTicketModel from '@/models/support.model';
import dbConnect from '@/utils/dbConnectionHandlers';
import { getServerSession } from 'next-auth';
import { authOption } from '../../auth/[...nextauth]/option';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  
  const session = await getServerSession(authOption);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const ticket = await supportTicketModel.findById(params.id)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name');

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Server error', details: error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  
  const session = await getServerSession(authOption);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const ticket = await supportTicketModel.findByIdAndDelete(params.id);
    
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Server error', details: error },
      { status: 500 }
    );
  }
}

// Optional: Add other methods or handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { 'Allow': 'GET, DELETE' } }
  );
}