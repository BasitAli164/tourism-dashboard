"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Users, Briefcase, Calendar, TrendingUp, MapPin, LucideIcon } from "lucide-react"

// Define TypeScript interfaces for structured data
interface Stat{
  title:string,
  value:number|string,
  icon:LucideIcon
}
interface Booking{
  id:number,
  customer:string,
  tour:string,
  date:string,
  amount:string
} 

interface RevenueData{
  name:string,
  revenue:number
}
interface TourData{
  name:string,
  bookings:number
}

// Mock data for demonstration purposes

const stats:Stat[] = [
  { title: "Total Tours", value: 50, icon: Briefcase },
  { title: "Active Tours", value: 35, icon: TrendingUp },
  { title: "Total Bookings", value: 1234, icon: Calendar },
  { title: "Total Revenue", value: "$123,456", icon: DollarSign },
  { title: "Active Users", value: 5678, icon: Users },
  { title: "Popular Destinations", value: 20, icon: MapPin },
]

const recentBookings:Booking[] = [
  { id: 1, customer: "John Doe", tour: "Paris Adventure", date: "2023-06-15", amount: "$1,200" },
  { id: 2, customer: "Jane Smith", tour: "Tokyo Explorer", date: "2023-06-14", amount: "$1,500" },
  { id: 3, customer: "Bob Johnson", tour: "New York City Tour", date: "2023-06-13", amount: "$800" },
  { id: 4, customer: "Alice Brown", tour: "Rome Historical Tour", date: "2023-06-12", amount: "$1,100" },
  { id: 5, customer: "Charlie Wilson", tour: "Sydney Harbour Tour", date: "2023-06-11", amount: "$950" },
]

const monthlyRevenue:RevenueData[] = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 4500 },
  { name: "May", revenue: 6000 },
  { name: "Jun", revenue: 5500 },
]

const popularTours:TourData[] = [
  { name: "Paris Adventure", bookings: 120 },
  { name: "Tokyo Explorer", bookings: 98 },
  { name: "New York City Tour", bookings: 85 },
  { name: "Rome Historical Tour", bookings: 72 },
  { name: "Sydney Harbour Tour", bookings: 65 },
]

export function DashboardPage1() {
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 hidden sm:grid grid-cols-1 lg:grid-cols-2  gap-6 ">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Tours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularTours} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 hidden sm:block">
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Tour</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.customer}</TableCell>
                  <TableCell>{booking.tour}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>{booking.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

