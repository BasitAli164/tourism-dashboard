import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnectionHandlers';
import bookingModel from '@/models/booking.model';
import Tour from '@/models/tour.model';

export async function GET() {
  try {
    await dbConnect();
    
    // Get current date and first day of current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get booking statistics
    const [totalBookings, confirmedBookings, pendingBookings, monthlyRevenue] = await Promise.all([
      bookingModel.countDocuments(),
      bookingModel.countDocuments({ status: 'confirmed' }),
      bookingModel.countDocuments({ status: 'pending' }),
      bookingModel.aggregate([
        {
          $match: {
            status: 'confirmed',
            date: { $gte: firstDayOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ])
    ]);

    // Get active tours count
    const activeTours = await Tour.countDocuments({ status: 'Published' });
    
    return NextResponse.json({
      totalBookings,
      confirmedBookings,
      pendingBookings,
      activeTours,
      revenue: monthlyRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
} 