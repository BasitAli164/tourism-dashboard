// src/app/api/bookings/[id]/message/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnectionHandlers';
import bookingModel from '@/models/booking.model';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise
    const { id } = await params;
    
    await dbConnect();
    const { message } = await request.json();
    const booking = await bookingModel.findById(id);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // In a real app, you would send an email here
    console.log(`Message to ${booking.email}: ${message}`);
    
    return NextResponse.json({ message: 'Message sent successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to send message: ${error.message}` },
      { status: 500 }
    );
  }
}