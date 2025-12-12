"use client";

import { useState, useEffect } from "react";
import { Search, Eye, MessageSquare, Trash2, UserPlus } from "lucide-react";
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
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Ticket {
  _id: string;
  subject: string;
  description: string;
  status: "Pending" | "In_Progress" | "Resolved" | "Closed";
  priority: "Low" | "Normal" | "High" | "Urgent";
  userId: {
    _id: string;
    name: string;
    email: string;
  } | null;
  assignedTo: {
    _id: string;
    name: string;
  } | null;
  response: Array<{
    message: string;
    respondedBy: string | { _id: string; name: string };
    respondedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Agent {
  _id: string;
  name: string;
  email: string;
}

const fetchSupportTickets = async (): Promise<Ticket[]> => {
  try {
    const res = await fetch("/api/support-tickets", { credentials: "include" });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Fetch tickets error:", error);
    throw error;
  }
};

const fetchAgents = async (): Promise<Agent[]> => {
  try {
    const res = await fetch("/api/agents", { credentials: "include" });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to fetch agents");
    }
    return await res.json();
  } catch (error) {
    console.error("Fetch agents error:", error);
    throw error;
  }
};

const isValidMongoId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

const SupportPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [responseText, setResponseText] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [assigningTicket, setAssigningTicket] = useState<Ticket | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ticketsData, agentsData] = await Promise.all([
          fetchSupportTickets(),
          fetchAgents(),
        ]);
        setTickets(ticketsData);
        setAgents(agentsData);
      } catch (error) {
        toast.error("Failed to load data", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };
    loadData();
  }, []);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      if (!isValidMongoId(ticketId)) {
        throw new Error("Invalid ticket ID format");
      }

      const res = await fetch(`/api/support-tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update status");
      }
      
      const updatedTicket = await res.json();
      setTickets(tickets.map(ticket =>
        ticket._id === ticketId ? updatedTicket : ticket
      ));
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  const handlePriorityChange = async (ticketId: string, newPriority: string) => {
    try {
      if (!isValidMongoId(ticketId)) {
        throw new Error("Invalid ticket ID format");
      }

      const res = await fetch(`/api/support-tickets/${ticketId}/priority`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update priority");
      }

      const updatedTicket = await res.json();
      setTickets(tickets.map(ticket =>
        ticket._id === ticketId ? updatedTicket : ticket
      ));
      toast.success("Priority updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update priority");
    }
  };

  const handleAssignAgent = async () => {
    if (!assigningTicket || !selectedAgentId) {
      toast.error("Missing required information for assignment");
      return;
    }
  
    try {
      if (!isValidMongoId(assigningTicket._id)) {
        throw new Error("Invalid ticket ID format");
      }
      if (!isValidMongoId(selectedAgentId)) {
        throw new Error("Invalid agent ID format");
      }
  
      const res = await fetch("/api/support-tickets/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: assigningTicket._id,
          agentId: selectedAgentId,
        }),
        credentials: "include",
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to assign agent");
      }
  
      const data = await res.json();
      const updatedTicket = data.ticket;
  
      setTickets(tickets.map(ticket =>
        ticket._id === assigningTicket._id ? updatedTicket : ticket
      ));
  
      toast.success("Agent assigned successfully");
    } catch (error) {
      console.error("Assignment error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to assign agent";
  
      if (errorMessage.toLowerCase().includes("not found")) {
        const refreshedTickets = await fetchSupportTickets();
        setTickets(refreshedTickets);
        toast.error("Ticket data refreshed, please try again");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setAssigningTicket(null);
      setSelectedAgentId("");
    }
  };
  
  const handleDelete = async (ticketId: string) => {
    try {
      if (!isValidMongoId(ticketId)) {
        throw new Error("Invalid ticket ID format");
      }

      const res = await fetch(`/api/support-tickets/${ticketId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete ticket");
      }

      setTickets(tickets.filter(ticket => ticket._id !== ticketId));
      toast.success("Ticket deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete ticket");
    }
  };

  const handleAddResponse = async (ticketId: string, responseText: string) => {
    try {
      if (!isValidMongoId(ticketId)) {
        throw new Error("Invalid ticket ID format");
      }

      const res = await fetch(`/api/support-tickets/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ticketId,
          message: responseText 
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add response");
      }

      const updatedTicket = await res.json();
      setTickets(tickets.map(ticket =>
        ticket._id === ticketId ? updatedTicket : ticket
      ));
      setResponseText("");
      toast.success("Response added successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add response");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Support Tickets</h1>
  
      <div className="mb-6">
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
      </div>
  
      <div className="overflow-x-auto">
        <Table className="w-full min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets
              .filter(ticket =>
                ticket.subject.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(ticket => (
                <TableRow key={ticket._id}>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
  
                  <TableCell>
                    <Select
                      value={ticket.status}
                      onValueChange={val => handleStatusChange(ticket._id, val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In_Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
  
                  <TableCell>
                    <Select
                      value={ticket.priority}
                      onValueChange={val => handlePriorityChange(ticket._id, val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
  
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{ticket.assignedTo?.name || "Unassigned"}</span>
                      {ticket.assignedTo && (
                        <span className="text-xs text-muted-foreground">
                          ID: {ticket.assignedTo._id}
                        </span>
                      )}
                    </div>
                  </TableCell>
  
                  <TableCell>
                    <div className="flex gap-2">
                      {/* View Ticket Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                const res = await fetch(
                                  `/api/support-tickets/${ticket._id}`,
                                  { credentials: "include" }
                                );
                                if (!res.ok) {
                                  const errorData = await res.json();
                                  throw new Error(errorData.error || "Failed to fetch ticket");
                                }
                                const data = await res.json();
                                setSelectedTicket(data);
                              } catch (error) {
                                toast.error(error instanceof Error ? error.message : "Failed to load ticket details");
                              }
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
  
                        {selectedTicket?._id === ticket._id && (
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Ticket Details</DialogTitle>
                              <DialogDescription>
                                View complete information about this support ticket.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold">Subject</h3>
                                <p>{selectedTicket.subject}</p>
                              </div>
                              <div>
                                <h3 className="font-semibold">Description</h3>
                                <p>{selectedTicket.description}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold">Status</h3>
                                  <p>{selectedTicket.status.replace("_", " ")}</p>
                                </div>
                                <div>
                                  <h3 className="font-semibold">Priority</h3>
                                  <p>{selectedTicket.priority}</p>
                                </div>
                                <div>
                                  <h3 className="font-semibold">Assigned To</h3>
                                  <p>
                                    {selectedTicket.assignedTo?.name || "Unassigned"}
                                    {selectedTicket.assignedTo && (
                                      <span className="text-xs block text-muted-foreground">
                                        ID: {selectedTicket.assignedTo._id}
                                      </span>
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="font-semibold">Created At</h3>
                                  <p>
                                    {new Date(selectedTicket.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              {selectedTicket.response.length > 0 && (
                                <div>
                                  <h3 className="font-semibold mb-2">Responses</h3>
                                  {selectedTicket.response.map((response, index) => (
                                    <div
                                      key={index}
                                      className="mb-2 p-2 bg-gray-100 rounded"
                                    >
                                      <p className="text-sm">{response.message}</p>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {typeof response.respondedBy === "object"
                                          ? response.respondedBy.name
                                          : "System"}{" "}
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
                            variant="outline"
                            size="sm"
                            onClick={() => setAssigningTicket(ticket)}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
  
                        {assigningTicket?._id === ticket._id && (
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Agent</DialogTitle>
                              <DialogDescription>
                                Choose an available support agent to handle this ticket.
                              </DialogDescription>
                              <div className="text-sm text-muted-foreground">
                                <p>Ticket ID: {ticket._id}</p>
                                <p>Subject: {ticket.subject}</p>
                              </div>
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
                                Confirm Assignment
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        )}
                      </Dialog>
  
                      {/* Add Response Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Response</DialogTitle>
                            <DialogDescription>
                              Send a response to the user for this support ticket.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Add response..."
                              value={responseText}
                              onChange={e => setResponseText(e.target.value)}
                            />
                            <Button
                              onClick={() => handleAddResponse(ticket._id, responseText)}
                              disabled={!responseText}
                            >
                              Send Response
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
  
                      {/* Delete Ticket Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(ticket._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SupportPage;