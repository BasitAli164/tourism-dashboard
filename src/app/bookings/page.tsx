"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Mail, Phone, Calendar, User, Users, CreditCard, CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Booking {
  _id: string;
  packageName: string;
  packageId: string;
  date: string;
  endDate: string;
  person: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  paymentStatus: string;
  amount: number;
  currency: string;
  notes?: string;
  createdAt: string;
}

interface Summary {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  revenue: number;
}

// API functions
const fetchBookings = async (searchTerm = '', statusFilter = 'all', sortBy = 'date') => {
  try {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (statusFilter !== 'all') params.append('status', statusFilter);
    params.append('sortBy', sortBy);
    
    const res = await fetch(`/api/bookings?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return await res.json();
  } catch (error) {
    throw error;
  }
};

const fetchBookingSummary = async () => {
  try {
    const res = await fetch('/api/bookings/summary');
    if (!res.ok) throw new Error('Failed to fetch summary');
    return await res.json();
  } catch (error) {
    throw error;
  }
};

const updateBookingStatus = async (id: string, status: string) => {
  try {
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return await res.json();
  } catch (error) {
    throw error;
  }
};

const sendMessageToCustomer = async (id: string, message: string) => {
  try {
    const res = await fetch(`/api/bookings/${id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    if (!res.ok) throw new Error('Failed to send message');
    return await res.json();
  } catch (error) {
    throw error;
  }
};

const deleteBooking = async (id: string) => {
  try {
    const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete booking');
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "packageName" | "createdAt">("date");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [summary, setSummary] = useState<Summary>({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    revenue: 0
  });
  const itemsPerPage = 5;

  useEffect(() => {
    const loadData = async () => {
      try {
        toast.promise(
          Promise.all([
            fetchBookings(searchTerm, statusFilter, sortBy),
            fetchBookingSummary()
          ]),
          {
            loading: 'Loading bookings...',
            success: ([bookingsData, summaryData]) => {
              setBookings(bookingsData);
              setSummary(summaryData);
              return 'Bookings loaded successfully';
            },
            error: 'Failed to load bookings'
          }
        );
      } catch (error) {
        toast.error("Failed to load data");
      }
    };
    loadData();
  }, [searchTerm, statusFilter, sortBy]);

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const paginatedBookings = bookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleView = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
    toast.info(`Viewing booking for ${booking.name}`);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      toast.promise(
        updateBookingStatus(id, newStatus),
        {
          loading: 'Updating status...',
          success: () => {
            setBookings(prev => 
              prev.map(booking => 
                booking._id === id ? { ...booking, status: newStatus } : booking
              )
            );
            setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
            return `Status updated to ${newStatus}`;
          },
          error: 'Failed to update status'
        }
      );
    } catch (error) {
      toast.error("Failed to update booking status");
    }
  };

  const handleSendMessage = async () => {
    if (!selectedBooking || !message.trim()) {
      toast.warning("Please enter a message");
      return;
    }

    try {
      toast.promise(
        sendMessageToCustomer(selectedBooking._id, message),
        {
          loading: 'Sending message...',
          success: () => {
            setMessage("");
            return `Message sent to ${selectedBooking.name}`;
          },
          error: 'Failed to send message'
        }
      );
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      toast.promise(
        deleteBooking(id),
        {
          loading: 'Deleting booking...',
          success: () => {
            setBookings(prev => prev.filter(booking => booking._id !== id));
            if (selectedBooking?._id === id) {
              setIsDialogOpen(false);
            }
            return "Booking deleted successfully";
          },
          error: 'Failed to delete booking'
        }
      );
    } catch (error) {
      toast.error("Failed to delete booking");
    }
  };

  const handlePrintDetails = () => {
    toast.info("Preparing booking details for printing...");
    console.log("Printing booking details:", selectedBooking);
  };

  const handleSaveChanges = () => {
    toast.success("Changes saved successfully");
    setIsDialogOpen(false);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "default";
      case "cancelled":
        return "default";
      default:
        return "outline";
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "partial":
        return "default";
      case "unpaid":
        return "default";
      case "refunded":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Bookings Management</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalBookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.confirmedBookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pendingBookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-2 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              toast.info(`Filtering by ${value === 'all' ? 'all statuses' : value}`);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(value) => {
              const sortValue = value as "date" | "name" | "packageName" | "createdAt";
              setSortBy(sortValue);
              toast.info(`Sorted by ${sortValue.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Trip Date</SelectItem>
              <SelectItem value="createdAt">Booking Date</SelectItem>
              <SelectItem value="packageName">Package Name</SelectItem>
              <SelectItem value="name">Customer Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBookings.length > 0 ? (
              paginatedBookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>
                    <div className="font-medium">{booking.packageName}</div>
                    <div className="text-xs text-muted-foreground">
                      {booking.packageId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{new Date(booking.date).toLocaleDateString()}</div>
                    {booking.endDate && (
                      <div className="text-xs text-muted-foreground">
                        to {new Date(booking.endDate).toLocaleDateString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>{booking.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {booking.person} {booking.person > 1 ? "people" : "person"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="text-xs">{booking.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span className="text-xs">{booking.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant={getStatusVariant(booking.status)} size="sm" className="h-6">
                      {booking.status === "confirmed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {booking.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                      {booking.status === "cancelled" && <XCircle className="h-3 w-3 mr-1" />}
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button variant={getPaymentStatusVariant(booking.paymentStatus)} size="sm" className="h-6">
                      {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {booking.amount.toLocaleString()} {booking.currency}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog open={isDialogOpen && selectedBooking?._id === booking._id} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(booking)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      {selectedBooking && (
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                            <DialogDescription>
                              Manage booking for {selectedBooking.name}
                            </DialogDescription>
                          </DialogHeader>
                          <Tabs defaultValue="details">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="details">Details</TabsTrigger>
                              <TabsTrigger value="actions">Actions</TabsTrigger>
                              <TabsTrigger value="communication">Communication</TabsTrigger>
                            </TabsList>
                            <TabsContent value="details">
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-semibold">Package Information</h3>
                                    <p>{selectedBooking.packageName} ({selectedBooking.packageId})</p>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">Trip Dates</h3>
                                    <p>
                                      {new Date(selectedBooking.date).toLocaleDateString()} -{" "}
                                      {new Date(selectedBooking.endDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">Customer Information</h3>
                                    <p>
                                      <User className="inline h-4 w-4 mr-1" />
                                      {selectedBooking.name}
                                    </p>
                                    <p>
                                      <Mail className="inline h-4 w-4 mr-1" />
                                      {selectedBooking.email}
                                    </p>
                                    <p>
                                      <Phone className="inline h-4 w-4 mr-1" />
                                      {selectedBooking.phone}
                                    </p>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">Group Size</h3>
                                    <p>
                                      <Users className="inline h-4 w-4 mr-1" />
                                      {selectedBooking.person} {selectedBooking.person > 1 ? "people" : "person"}
                                    </p>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">Payment Information</h3>
                                    <p>
                                      Status: <Button variant={getPaymentStatusVariant(selectedBooking.paymentStatus)} size="sm" className="h-6">
                                        {selectedBooking.paymentStatus.charAt(0).toUpperCase() + selectedBooking.paymentStatus.slice(1)}
                                      </Button>
                                    </p>
                                    <p>
                                      Amount: {selectedBooking.amount} {selectedBooking.currency}
                                    </p>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">Booking Status</h3>
                                    <p>
                                      <Button variant={getStatusVariant(selectedBooking.status)} size="sm" className="h-6">
                                        {selectedBooking.status === "confirmed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                        {selectedBooking.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                        {selectedBooking.status === "cancelled" && <XCircle className="h-3 w-3 mr-1" />}
                                        {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                                      </Button>
                                    </p>
                                    <p>
                                      Booked on: {new Date(selectedBooking.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                {selectedBooking.notes && (
                                  <div>
                                    <h3 className="font-semibold">Special Notes</h3>
                                    <p className="text-sm p-2 bg-gray-50 rounded">{selectedBooking.notes}</p>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                            <TabsContent value="actions">
                              <div className="space-y-4">
                                <h3 className="font-semibold">Update Booking Status</h3>
                                <div className="flex gap-2 flex-wrap">
                                  <Button
                                    variant={selectedBooking.status === "confirmed" ? "default" : "outline"}
                                    onClick={() => handleStatusChange(selectedBooking._id, "confirmed")}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Confirm
                                  </Button>
                                  <Button
                                    variant={selectedBooking.status === "pending" ? "default" : "outline"}
                                    onClick={() => handleStatusChange(selectedBooking._id, "pending")}
                                  >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Mark Pending
                                  </Button>
                                  <Button
                                    variant={selectedBooking.status === "cancelled" ? "default" : "outline"}
                                    onClick={() => handleStatusChange(selectedBooking._id, "cancelled")}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel
                                  </Button>
                                </div>
                                <div className="pt-4">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      toast.promise(
                                        handleDeleteBooking(selectedBooking._id),
                                        {
                                          loading: 'Preparing to delete...',
                                          success: 'Booking marked for deletion',
                                          error: 'Failed to initiate deletion'
                                        }
                                      );
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Booking
                                  </Button>
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent value="communication">
                              <div className="space-y-4">
                                <h3 className="font-semibold">Send Message to Customer</h3>
                                <Textarea
                                  placeholder="Type your message here..."
                                  value={message}
                                  onChange={(e) => setMessage(e.target.value)}
                                />
                                <Button onClick={handleSendMessage}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Message
                                </Button>
                              </div>
                            </TabsContent>
                          </Tabs>
                          <DialogFooter>
                            <Button variant="secondary" onClick={handlePrintDetails}>
                              Print Details
                            </Button>
                            <Button onClick={handleSaveChanges}>
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        toast.promise(
                          handleDeleteBooking(booking._id),
                          {
                            loading: 'Preparing to delete...',
                            success: 'Booking marked for deletion',
                            error: 'Failed to initiate deletion'
                          }
                        );
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentPage((prev) => Math.max(prev - 1, 1));
              toast.info(`Navigated to page ${Math.max(currentPage - 1, 1)}`);
            }}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentPage((prev) => Math.min(prev + 1, totalPages));
              toast.info(`Navigated to page ${Math.min(currentPage + 1, totalPages)}`);
            }}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}