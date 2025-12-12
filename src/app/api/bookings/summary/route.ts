import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnectionHandlers';
import bookingModel from '@/models/booking.model';

export async function GET() {
  try {
    await dbConnect();
    
    const [totalBookings, confirmedBookings, pendingBookings, revenue] = await Promise.all([
      bookingModel.countDocuments(),
      bookingModel.countDocuments({ status: 'confirmed' }),
      bookingModel.countDocuments({ status: 'pending' }),
      bookingModel.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    
    return NextResponse.json({
      totalBookings,
      confirmedBookings,
      pendingBookings,
      revenue: revenue[0]?.total || 0
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch summary ${error}` },
      { status: 500 }
    );
  }
}