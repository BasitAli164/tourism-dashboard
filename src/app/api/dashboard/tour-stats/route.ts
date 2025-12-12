import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnectionHandlers';
import Tour from '@/models/tour.model';
import bookingModel from '@/models/booking.model';

export async function GET() {
  try {
    await dbConnect();
    
    // Get all published tours
    const tours = await Tour.find({ status: 'Published' })
      .select('_id title')
      .limit(5);
    
    // Get booking statistics for each tour
    const tourStats = await Promise.all(
      tours.map(async (tour) => {
        const bookings = await bookingModel.find({
          packageId: tour._id.toString(),
          status: 'confirmed'
        });
        
        return {
          name: tour.title,
          bookings: bookings.length,
          revenue: bookings.reduce((sum, booking) => sum + booking.amount, 0)
        };
      })
    );
    
    // Sort by revenue in descending order
    tourStats.sort((a, b) => b.revenue - a.revenue);
    
    return NextResponse.json(tourStats);
  } catch (error) {
    console.error('Tour stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tour statistics' },
      { status: 500 }
    );
  }
} 