import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnectionHandlers';
import bookingModel from '@/models/booking.model';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const booking = await bookingModel.findById(params.id);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const data = await request.json();
    const booking = await bookingModel.findByIdAndUpdate(params.id, data, { new: true });
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const booking = await bookingModel.findByIdAndDelete(params.id);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}