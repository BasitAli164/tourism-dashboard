"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Trash2, UserCheck, CheckCircle, UserPlus, MessageSquare } from "lucide-react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Agent {
  _id: string;
  name: string;
  email: string;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  date: string;
  status: "Pending" | "In_Progress" | "Resolved" | "Closed";
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  } | null;
  description?: string;
  response?: Array<{
    message: string;
    respondedBy: string | { _id: string; name: string };
    respondedAt: string;
  }>;
}

const fetchInquiries = async (): Promise<Inquiry[]> => {
  try {
    const response = await fetch('/api/inquiries');
    if (!response.ok) {
      throw new Error('Failed to fetch inquiries');
    }
    const data = await response.json();
    return data.map((inquiry: any) => ({
      ...inquiry,
      assignedTo: inquiry.assignedTo ? {
        _id: inquiry.assignedTo._id,
        name: inquiry.assignedTo.name,
        email: inquiry.assignedTo.email
      } : null
    }));
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    throw error;
  }
};

const fetchAgents = async (): Promise<Agent[]> => {
  try {
    const response = await fetch('/api/agents'); // You'll need to create this endpoint
    if (!response.ok) {
      throw new Error('Failed to fetch agents');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
};

const updateInquiryStatus = async (id: string, status: Inquiry["status"]) => {
  try {
    const response = await fetch(`/api/inquiries/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error updating status:', error);
    return false;
  }
};

const updateInquiryAssignedTo = async (id: string, assignedTo: string) => {
  try {
    const response = await fetch(`/api/inquiries/${id}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assignedTo }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error assigning agent:', error);
    return false;
  }
};

const deleteInquiry = async (id: string) => {
  try {
    const response = await fetch(`/api/inquiries/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return false;
  }
};
const addInquiryResponse = async (id: string, message: string) => {
  try {
    const response = await fetch(`/api/inquiries/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message,
        inquiryId: id // Include the inquiry ID
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add response');
    }
    
    const data = await response.json();
    return data.success;
    
  } catch (error) {
    console.error('Error adding response:', error);
    return false;
  }
};
export default function InquiriesPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [assigningInquiry, setAssigningInquiry] = useState<Inquiry | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [responseText, setResponseText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedInquiries, fetchedAgents] = await Promise.all([
          fetchInquiries(),
          fetchAgents()
        ]);
        setInquiries(fetchedInquiries);
        setAgents(fetchedAgents);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredInquiries = inquiries
    .filter(
      (inquiry) =>
        inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const paginatedInquiries = filteredInquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusChange = async (id: string, status: Inquiry["status"]) => {
    const success = await updateInquiryStatus(id, status);
    if (success) {
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
      );
      toast.success("Status updated", {
        description: `Inquiry has been updated to status: ${status}.`,
        icon: <CheckCircle className="h-5 w-5" />,
        duration: 2000,
      });
    } else {
      toast.error("Failed to update status", {
        description: "Please try again.",
        duration: 2000,
      });
    }
  };

  const handleAssignAgent = async () => {
    if (!assigningInquiry || !selectedAgentId) {
      toast.error("Please select an agent to assign");
      return;
    }

    const agent = agents.find(a => a._id === selectedAgentId);
    if (!agent) {
      toast.error("Selected agent not found");
      return;
    }

    const success = await updateInquiryAssignedTo(assigningInquiry.id, agent._id);
    if (success) {
      setInquiries(prev => 
        prev.map(inq => 
          inq.id === assigningInquiry.id 
            ? { ...inq, assignedTo: agent, status: "Closed" } 
            : inq
        )
      );
      toast.success("Agent assigned", {
        description: `Inquiry assigned to ${agent.name}.`,
        icon: <UserCheck className="h-5 w-5" />,
        duration: 2000,
      });
      setAssigningInquiry(null);
      setSelectedAgentId("");
    } else {
      toast.error("Failed to assign agent", {
        description: "Please try again.",
        duration: 2000,
      });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteInquiry(id);
    if (success) {
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
      toast.success("Inquiry deleted", {
        icon: <Trash2 className="h-5 w-5" />,
        duration: 2000,
      });
    } else {
      toast.error("Failed to delete inquiry", {
        description: "Please try again.",
        duration: 2000,
      });
    }
  };

  const handleAddResponse = async (id: string) => {
    if (!responseText.trim()) {
      toast.error("Response cannot be empty");
      return;
    }

    const success = await addInquiryResponse(id, responseText);
    if (success) {
      setInquiries(prev => 
        prev.map(inq => {
          if (inq.id !== id) return inq;
          
          const newResponse = {
            message: responseText,
            respondedBy: { _id: "current-user", name: "You" },
            respondedAt: new Date().toISOString()
          };
          
          return {
            ...inq,
            response: [...(inq.response || []), newResponse]
          };
        })
      );
      
      setResponseText("");
      toast.success("Response added", {
        description: "Your response has been recorded.",
        duration: 2000,
      });
    } else {
      toast.error("Failed to add response", {
        description: "Please try again.",
        duration: 2000,
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />

      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Inquiries</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={(value: "date" | "name") => setSortBy(value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort by Date</SelectItem>
            <SelectItem value="name">Sort by Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-10">Loading inquiries...</div>
        ) : paginatedInquiries.length === 0 ? (
          <div className="text-center py-10">No inquiries found.</div>
        ) : (
          <Table className="min-w-[800px] w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell>{inquiry.name}</TableCell>
                  <TableCell>{inquiry.email}</TableCell>
                  <TableCell>{inquiry.subject}</TableCell>
                  <TableCell>{new Date(inquiry.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Select
                      value={inquiry.status}
                      onValueChange={(val) =>
                        handleStatusChange(inquiry.id, val as Inquiry["status"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In_Progress">In_Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{inquiry.assignedTo?.name || "Unassigned"}</span>
                      {inquiry.assignedTo && (
                        <span className="text-xs text-muted-foreground">
                          ID: {inquiry.assignedTo._id}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* View Inquiry Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedInquiry(inquiry)}
                            aria-label="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>

                        {selectedInquiry?.id === inquiry.id && (
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Inquiry Details</DialogTitle>
                              <DialogDescription>
                                View the full inquiry details below.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold">Name</h3>
                                  <p>{selectedInquiry.name}</p>
                                </div>
                                <div>
                                  <h3 className="font-semibold">Email</h3>
                                  <p>{selectedInquiry.email}</p>
                                </div>
                                <div>
                                  <h3 className="font-semibold">Subject</h3>
                                  <p>{selectedInquiry.subject}</p>
                                </div>
                                <div>
                                  <h3 className="font-semibold">Date</h3>
                                  <p>{new Date(selectedInquiry.date).toLocaleString()}</p>
                                </div>
                                <div>
                                  <h3 className="font-semibold">Status</h3>
                                  <p>{selectedInquiry.status}</p>
                                </div>
                                <div>
                                  <h3 className="font-semibold">Assigned To</h3>
                                  <p>
                                    {selectedInquiry.assignedTo?.name || "Unassigned"}
                                    {selectedInquiry.assignedTo && (
                                      <span className="text-xs block text-muted-foreground">
                                        ID: {selectedInquiry.assignedTo._id}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              {selectedInquiry.description && (
                                <div>
                                  <h3 className="font-semibold">Description</h3>
                                  <p>{selectedInquiry.description}</p>
                                </div>
                              )}
                              {selectedInquiry.response && selectedInquiry.response.length > 0 && (
                                <div>
                                  <h3 className="font-semibold mb-2">Responses</h3>
                                  {selectedInquiry.response.map((response, index) => (
                                    <div
                                      key={index}
                                      className="mb-2 p-2 bg-gray-100 rounded"
                                    >
                                      <p className="text-sm">{response.message}</p>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {typeof response.respondedBy === "object"
                                          ? response.respondedBy.name
                                          : response.respondedBy}{" "}
                                        -{" "}
                                        {new Date(response.respondedAt).toLocaleString()}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>

                      {/* Assign Agent Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAssigningInquiry(inquiry)}
                            aria-label="Assign agent"
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>

                        {assigningInquiry?.id === inquiry.id && (
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Agent</DialogTitle>
                              <DialogDescription>
                                Choose an agent to assign to this inquiry.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Select
                                value={selectedAgentId}
                                onValueChange={setSelectedAgentId}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an agent" />
                                </SelectTrigger>
                                <SelectContent>
                                  {agents.map(agent => (
                                    <SelectItem key={agent._id} value={agent._id}>
                                      <div className="flex items-center gap-2">
                                        <span>{agent.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                          ({agent._id})
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={handleAssignAgent}
                                disabled={!selectedAgentId}
                              >
                                Assign Agent
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        )}
                      </Dialog>

                      {/* Add Response Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            aria-label="Add response"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Response</DialogTitle>
                            <DialogDescription>
                              Add a response to this inquiry.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Enter your response..."
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                            />
                            <Button
                              onClick={() => handleAddResponse(inquiry.id)}
                              disabled={!responseText.trim()}
                            >
                              Submit Response
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(inquiry.id)}
                        aria-label="Delete inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </Button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}