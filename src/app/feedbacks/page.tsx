"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
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
import { Toaster, toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Feedback, parseFeedbackItem } from "@/schemas/feedback-schema"

// API functions
const fetchFeedback = async (): Promise<Feedback[]> => {
  try {
    const response = await fetch('/api/feedback', {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format received from server');
    }

    return data.map(parseFeedbackItem);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    throw new Error('Failed to fetch feedback. Please try again.');
  }
};

const updateFeedbackStatus = async (
  id: string,
  status: "Pending" | "Approved" | "Rejected"
): Promise<Feedback> => {
  try {
    const response = await fetch(`/api/feedback/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update status');
    }

    return parseFeedbackItem(await response.json());
  } catch (error) {
    console.error("Error updating status:", error);
    throw error instanceof Error ? error : new Error('Failed to update status');
  }
};

const addFeedbackResponse = async (id: string, message: string): Promise<Feedback> => {
  try {
    const respondedBy = "68220e56ebd1451b1d754207"; // Mock user ID
    
    const response = await fetch('/api/feedback/response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feedbackId: id,
        message,
        respondedBy,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to add response');
    }

    return parseFeedbackItem(await response.json());
  } catch (error) {
    console.error("Error adding response:", error);
    throw error instanceof Error ? error : new Error('Failed to add response');
  }
};

const deleteFeedback = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`/api/feedback/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete feedback');
    }
  } catch (error) {
    console.error("Error deleting feedback:", error);
    throw error instanceof Error ? error : new Error('Failed to delete feedback');
  }
};

export default function FeedbackPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "user">("date");
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedFeedback = await fetchFeedback();
        setFeedback(fetchedFeedback);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load feedback';
        setError(message);
        toast.error("Failed to load feedback", {
          description: message,
          icon: <XCircle className="h-5 w-5" />,
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadFeedback();
  }, []);

  const filteredFeedback = feedback
    .filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.user?.name?.toLowerCase().includes(searchLower) ||
        item.message.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return (a.user?.name || "").localeCompare(b.user?.name || "");
    });

  const handleView = (item: Feedback) => {
    setSelectedFeedback(item);
  };

  const handleStatusChange = async (id: string, status: "Pending" | "Approved" | "Rejected") => {
    try {
      const updatedFeedback = await updateFeedbackStatus(id, status);
      setFeedback(prev => prev.map(item => item._id === id ? updatedFeedback : item));
      toast.success("Status Updated", {
        description: `Feedback status updated to ${status}.`,
        icon: <CheckCircle className="h-5 w-5" />,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      toast.error("Failed to update status", {
        description: message,
        icon: <XCircle className="h-5 w-5" />,
      });
    }
  };

  const handleAddResponse = async (id: string, response: string) => {
    try {
      const updatedFeedback = await addFeedbackResponse(id, response);
      setFeedback(prev => prev.map(item => item._id === id ? updatedFeedback : item));
      setResponseText("");
      toast.success("Response Sent", {
        description: "Response added successfully.",
        icon: <CheckCircle className="h-5 w-5" />,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send response';
      toast.error("Failed to send response", {
        description: message,
        icon: <XCircle className="h-5 w-5" />,
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFeedback(id);
      setFeedback(prev => prev.filter(item => item._id !== id));
      toast.success("Feedback Deleted", {
        description: "Feedback has been removed.",
        icon: <Trash2 className="h-5 w-5" />,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete feedback';
      toast.error("Failed to delete feedback", {
        description: message,
        icon: <XCircle className="h-5 w-5" />,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Feedback</h1>
        <div className="flex justify-center items-center h-64">
          <p>Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Feedback</h1>
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Feedback</h1>

      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as "date" | "user")}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort by Date</SelectItem>
            <SelectItem value="user">Sort by User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFeedback.length > 0 ? (
              filteredFeedback.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.user?.name || 'Unknown User'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {item.message}
                  </TableCell>
                  <TableCell>
                    {new Date(item.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : item.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleView(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Feedback Details</DialogTitle>
                          </DialogHeader>
                          {selectedFeedback && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <div>
                                  <strong>User:</strong> {selectedFeedback.user?.name || 'Unknown User'}
                                </div>
                                {selectedFeedback.user?.email && (
                                  <div>
                                    <strong>Email:</strong> {selectedFeedback.user.email}
                                  </div>
                                )}
                                <div>
                                  <strong>Date:</strong>{" "}
                                  {new Date(selectedFeedback.date).toLocaleString()}
                                </div>
                                <div>
                                  <strong>Status:</strong> {selectedFeedback.status}
                                </div>
                                <div>
                                  <strong>Category:</strong> {selectedFeedback.category}
                                </div>
                              </div>

                              <div className="mt-4">
                                <h3 className="font-medium mb-2">Message:</h3>
                                <p className="text-muted-foreground">
                                  {selectedFeedback.message}
                                </p>
                              </div>

                              {selectedFeedback.responses && selectedFeedback.responses.length > 0 && (
                                <div className="mt-4">
                                  <h3 className="font-medium mb-2">Responses:</h3>
                                  <div className="space-y-3">
                                    {selectedFeedback.responses.map((response) => (
                                      <div
                                        key={response._id}
                                        className="p-3 bg-gray-50 rounded-lg"
                                      >
                                        <div className="flex justify-between items-start">
                                          <strong>{response.respondedBy?.name || 'Unknown'}</strong>
                                          <span className="text-xs text-muted-foreground">
                                            {new Date(response.respondedAt).toLocaleString()}
                                          </span>
                                        </div>
                                        <p className="mt-1 text-sm">
                                          {response.message}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="mt-4 space-y-4">
                                <div>
                                  <Select
                                    value={selectedFeedback.status}
                                    onValueChange={(value) =>
                                      handleStatusChange(
                                        selectedFeedback._id,
                                        value as "Pending" | "Approved" | "Rejected"
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Update Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Pending">Pending</SelectItem>
                                      <SelectItem value="Approved">Approved</SelectItem>
                                      <SelectItem value="Rejected">Rejected</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setSelectedFeedback(item)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Respond to Feedback</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (selectedFeedback) {
                                handleAddResponse(selectedFeedback._id, responseText);
                              }
                            }}
                          >
                            <Textarea
                              placeholder="Type your response here..."
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              className="mt-2 min-h-[120px]"
                              required
                            />
                            <Button
                              type="submit"
                              className="mt-4 w-full"
                              disabled={!responseText.trim()}
                            >
                              Send Response
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No feedback found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}