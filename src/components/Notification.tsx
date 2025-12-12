// components/Notification.tsx
"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Notification } from "@/schemas/notificationSchema";
import { cn } from "@/lib/utils";

const initialNotifications: Notification[] = [
  // ... (your initial notifications array remains the same)
  {
    id: "1",
    title: "New Tour Added",
    message: "Check out our latest tour package for Skardu!",
    time: "2h ago",
    read: false,
  },
  {
    id: "2",
    title: "Booking Confirmed",
    message: "Your booking for Hunza tour has been confirmed!",
    time: "1d ago",
    read: true,
  },
  {
    id: "3",
    title: "Discount Offer",
    message: "Limited-time 20% off on Gilgit tours!",
    time: "3d ago",
    read: false,
  },
  {
    id: "4",
    title: "Payment Successful",
    message: "Your payment for the tour has been processed successfully.",
    time: "5h ago",
    read: true,
  },
  {
    id: "5",
    title: "Flight Delayed",
    message: "Your flight to Skardu has been delayed by 2 hours.",
    time: "6h ago",
    read: false,
  },
  {
    id: "6",
    title: "New Blog Post",
    message: "Read our latest blog on top travel destinations in Pakistan.",
    time: "8h ago",
    read: false,
  },
  {
    id: "7",
    title: "Upcoming Trip Reminder",
    message: "Your Hunza tour is scheduled for tomorrow. Pack your bags!",
    time: "10h ago",
    read: true,
  },
  {
    id: "8",
    title: "Limited Seats Left",
    message: "Only 5 seats left for the Naran tour! Book now!",
    time: "12h ago",
    read: false,
  },
  {
    id: "9",
    title: "Special Promotion",
    message: "Use code TRAVEL10 to get 10% off your next trip!",
    time: "1d ago",
    read: false,
  },
  {
    id: "10",
    title: "Customer Support Response",
    message: "Your support ticket has been resolved. Check your email for details.",
    time: "2d ago",
    read: true,
  },
  {
    id: "11",
    title: "Review Request",
    message: "Share your experience about the recent Hunza trip!",
    time: "3d ago",
    read: false,
  },
  {
    id: "12",
    title: "New Feature Added",
    message: "Now you can track your tour itinerary in real-time!",
    time: "4d ago",
    read: true,
  },
  {
    id: "13",
    title: "Booking Canceled",
    message: "Your Swat tour booking has been canceled as per your request.",
    time: "5d ago",
    read: false,
  },
  {
    id: "14",
    title: "Weather Update",
    message: "Snowfall expected in Skardu next week. Pack accordingly!",
    time: "6d ago",
    read: false,
  },
  {
    id: "15",
    title: "Referral Reward",
    message: "You earned Rs. 500 for referring a friend!",
    time: "1w ago",
    read: false,
  },
  {
    id: "16",
    title: "Tour Guide Assigned",
    message: "Your tour guide for the upcoming trip has been assigned.",
    time: "1w ago",
    read: true,
  },
  {
    id: "17",
    title: "Hotel Upgrade Available",
    message: "Upgrade your hotel stay at a 20% discount!",
    time: "1w ago",
    read: false,
  },
  {
    id: "18",
    title: "New Destination Added",
    message: "Explore our new tour package for Fairy Meadows!",
    time: "2w ago",
    read: false,
  },
  {
    id: "19",
    title: "Flight Reminder",
    message: "Your flight for the Gilgit tour departs in 6 hours.",
    time: "2w ago",
    read: true,
  },
  {
    id: "20",
    title: "Loyalty Points Update",
    message: "You've earned 1000 loyalty points on your recent trip.",
    time: "3w ago",
    read: false,
  },
];

export default function NotificationComponent() {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Calculate the number of unread notifications
  const unreadCount = notifications.filter((notif) => !notif.read).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-6 w-6" />
          {/* Show unread count */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 right-0 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-white rounded-md shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Notifications</h3>
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "p-3 rounded-md cursor-pointer transition-all",
                  notif.read ? "bg-gray-100" : "bg-blue-50"
                )}
                onClick={() => markAsRead(notif.id)}
              >
                <h4 className="font-semibold text-sm">{notif.title}</h4>
                <p className="text-xs text-gray-600">{notif.message}</p>
                <span className="text-xs text-gray-400">{notif.time}</span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No new notifications</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}