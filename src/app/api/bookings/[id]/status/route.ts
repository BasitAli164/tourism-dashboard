import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnectionHandlers';
import bookingModel from '@/models/booking.model';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { status } = await request.json();
    
    if (!['confirmed', 'pending', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    const booking = await bookingModel.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    );
  }
}