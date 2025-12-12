import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnectionHandlers';
import bookingModel from '@/models/booking.model';

export async function GET() {
  try {
    await dbConnect();
    
    // Get current date and calculate date 6 months ago
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    // Aggregate bookings by month
    const monthlyBookings = await bookingModel.aggregate([
      {
        $match: {
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    // Format the data for the frontend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedData = monthlyBookings.map(item => ({
      month: months[item._id.month - 1],
      bookings: item.bookings,
      revenue: item.revenue
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Booking trends error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking trends' },
      { status: 500 }
    );
  }
} 