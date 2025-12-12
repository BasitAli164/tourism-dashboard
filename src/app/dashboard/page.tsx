"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Calendar, Users, DollarSign, MessageSquare, MapPin, Star } from "lucide-react";
import axios from "axios";

// TypeScript interfaces
interface DashboardStats {
  title: string;
  value: number;
  icon: any;
  change?: number;
}

interface BookingTrend {
  month: string;
  bookings: number;
  revenue: number;
}

interface TourStats {
  name: string;
  bookings: number;
  revenue: number;
}

export default function Dashboard() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [bookingTrends, setBookingTrends] = useState<BookingTrend[]>([]);
  const [tourStats, setTourStats] = useState<TourStats[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/signin");
    }
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [summaryRes, trendsRes, tourStatsRes] = await Promise.all([
        axios.get('/api/dashboard/summary'),
        axios.get('/api/dashboard/trends'),
        axios.get('/api/dashboard/tour-stats')
      ]);

      const { totalBookings, confirmedBookings, pendingBookings, activeTours, revenue } = summaryRes.data;

      // Update stats
      setStats([
        { 
          title: "Total Bookings", 
          value: totalBookings, 
          icon: Calendar,
          change: totalBookings > 0 
      ? Number(((confirmedBookings / totalBookings) * 100).toFixed(1)) 
      : 0, 
        },
        { 
          title: "Active Tours", 
          value: activeTours, 
          icon: MapPin,
          change: totalBookings>0?Number(((confirmedBookings / totalBookings) * 100).toFixed(1)):0,
        },
        { 
          title: "Monthly Revenue", 
          value: revenue, 
          icon: DollarSign,
          change: 0
        },
        { 
          title: "Pending Bookings", 
          value: pendingBookings, 
          icon: Users,
          change: totalBookings>0?Number(((pendingBookings / totalBookings) * 100).toFixed(1)):0
        },
      ]);

      setBookingTrends(trendsRes.data);
      setTourStats(tourStatsRes.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="container mx-auto p-4 md:p-6 w-full">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="w-full hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stat.title === "Monthly Revenue" 
                      ? `$${stat.value.toLocaleString()}`
                      : stat.value}
                  </div>
                  {stat.change && (
                    <p className="text-xs text-muted-foreground">
                      {stat.change}% of total
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Booking Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bookingTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="bookings"
                      stroke="#8884d8"
                      name="Bookings"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#82ca9d"
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader>
                <CardTitle>Top Tours</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tourStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bookings" fill="#8884d8" name="Bookings" />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
