import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnectionHandlers';
import bookingModel from '@/models/booking.model';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { message } = await request.json();
    const booking = await bookingModel.findById(params.id);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // In a real app, you would send an email here
    console.log(`Message to ${booking.email}: ${message}`);
    
    return NextResponse.json({ message: 'Message sent successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}