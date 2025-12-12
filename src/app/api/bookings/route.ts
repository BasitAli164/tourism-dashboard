import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnectionHandlers';
import bookingModel from '@/models/booking.model';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'date';
    const searchTerm = searchParams.get('search');
    
    let query = {};
    
    if (status && status !== 'all') {
      query = { ...query, status };
    }
    
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, 'i');
      query = {
        ...query,
        $or: [
          { packageName: searchRegex },
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ]
      };
    }
    
    let sortOption = {};
    switch (sortBy) {
      case 'date':
        sortOption = { date: -1 };
        break;
      case 'name':
        sortOption = { name: 1 };
        break;
      case 'packageName':
        sortOption = { packageName: 1 };
        break;
      case 'createdAt':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { date: -1 };
    }
    
    const bookings = await bookingModel.find(query).sort(sortOption);
    
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const booking = await bookingModel.create(data);
    
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}