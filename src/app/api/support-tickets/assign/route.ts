import { NextRequest, NextResponse } from 'next/server';
import supportTicketModel from '@/models/support.model';
import Agent from '@/models/agent.model';
import dbConnect from '@/utils/dbConnectionHandlers';
import { getServerSession } from 'next-auth';
import { authOption } from '@/app/api/auth/[...nextauth]/option';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  await dbConnect();

  const session = await getServerSession(authOption);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ticketId, agentId } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return NextResponse.json({ error: 'Invalid ticket ID format' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return NextResponse.json({ error: 'Invalid agent ID format' }, { status: 400 });
    }

    const agent = await Agent.findById(agentId);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (!agent.isAvailable || agent.status !== 'active') {
      return NextResponse.json({ error: 'Agent is not available for assignment' }, { status: 400 });
    }

    const existingTicket = await supportTicketModel.findById(ticketId);
    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const updatedTicket = await supportTicketModel.findByIdAndUpdate(
      ticketId,
      {
        assignedTo: agentId,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: 'assignedTo',
      model: 'Agent',
      select: 'name email department',
    });

    await Agent.findByIdAndUpdate(agentId, {
      $addToSet: { assignedTickets: ticketId },
    });

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
      message: 'Agent assigned successfully',
    });
  } catch (error) {
    console.error('Assignment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
