"use client";

import { useState, useEffect } from "react";
import {
  Plus, Search, Edit, Trash2, XCircle, CheckCircle, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";
import { StaffSchema, Staff } from "@/schemas/staffSettingSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// API Functions
const fetchStaffs = async (searchTerm: string, sortBy: string): Promise<Staff[]> => {
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  params.append('sortBy', sortBy);
  
  const response = await fetch(`/api/staff?${params.toString()}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch staff');
  }
  const { data } = await response.json();
  return data;
};

const createStaff = async (staff: Omit<Staff, 'id'>): Promise<Staff> => {
  const response = await fetch('/api/staff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(staff),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create staff');
  return data.data;
};

const updateStaff = async (id: string, staff: Partial<Staff>): Promise<Staff> => {
  const response = await fetch(`/api/staff/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(staff),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update staff');
  return data.data;
};

const deleteStaff = async (id: string): Promise<boolean> => {
  const response = await fetch(`/api/staff/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete staff');
  return true;
};

export default function StaffManagementPage() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "role">("name");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewStaff, setViewStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<Staff>({
    resolver: zodResolver(StaffSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Support",
      phone: "",
      address: "",
      department: "",
      joiningDate: "",
      notes: ""
    }
  });

  // Reset form when dialog opens/closes or currentStaff changes
  useEffect(() => {
    if (isDialogOpen) {
      if (currentStaff) {
        form.reset(currentStaff);
      } else {
        form.reset();
      }
    }
  }, [isDialogOpen, currentStaff, form]);

  // Load staff data
  useEffect(() => {
    const loadStaffs = async () => {
      try {
        setIsLoading(true);
        const fetched = await fetchStaffs(searchTerm, sortBy);
        setStaffs(fetched);
      } catch (error) {
        toast.error("Error loading staff", {
          description: error instanceof Error ? error.message : "Unknown error",
          icon: <XCircle className="h-5 w-5" />,
          duration: 2000,
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadStaffs();
  }, [searchTerm, sortBy]);

  const handleAdd = () => {
    setCurrentStaff(null);
    form.reset({
      name: "",
      email: "",
      role: "Support",
      phone: "",
      address: "",
      department: "",
      joiningDate: "",
      notes: ""
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (staff: Staff) => {
    setCurrentStaff(staff);
    form.reset(staff);
    setIsDialogOpen(true);
  };

  const handleView = (staff: Staff) => {
    setViewStaff(staff);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteStaff(id);
      if (success) {
        setStaffs(staffs.filter((staff) => staff.id !== id));
        toast.success("Staff deleted", {
          description: "Staff member has been removed.",
          icon: <Trash2 className="h-5 w-5" />,
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error("Deletion failed", {
        description: error instanceof Error ? error.message : "Unknown error",
        icon: <XCircle className="h-5 w-5" />,
        duration: 2000,
      });
    }
  };

  const onSubmit = async (data: Staff) => {
    try {
      let response: Staff;
      
      if (currentStaff && currentStaff.id) {
        response = await updateStaff(currentStaff.id, data);
        setStaffs(staffs.map(staff => 
          staff.id === currentStaff.id ? response : staff
        ));
        toast.success("Staff updated", {
          description: "Staff member has been updated.",
          icon: <CheckCircle className="h-5 w-5" />,
          duration: 2000,
        });
      } else {
        response = await createStaff(data);
        setStaffs([...staffs, response]);
        toast.success("Staff added", {
          description: "New staff member has been added.",
          icon: <CheckCircle className="h-5 w-5" />,
          duration: 2000,
        });
      }
      
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Operation failed", {
        description: error instanceof Error ? error.message : "Unknown error",
        icon: <XCircle className="h-5 w-5" />,
        duration: 2000,
      });
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Staff Management</h1>
        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Staff
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as "name" | "role")}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="role">Sort by Role</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[800px] w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffs.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>{staff.name}</TableCell>
                <TableCell>{staff.email}</TableCell>
                <TableCell>{staff.role}</TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(staff)}
                      className="h-10 w-10 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(staff)}
                      className="h-10 w-10 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => staff.id && handleDelete(staff.id)}
                      className="h-10 w-10 p-0"
                      disabled={!staff.id}
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

      {/* Add/Edit Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setCurrentStaff(null);
            form.reset({
              name: "",
              email: "",
              role: "Support",
              phone: "",
              address: "",
              department: "",
              joiningDate: "",
              notes: ""
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentStaff ? "Edit Staff" : "Add New Staff"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
              {/* Name Field */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Label htmlFor="name" className="sm:w-1/4">Name *</Label>
                <div className="flex-1 space-y-2 w-full">
                  <Input
                    id="name"
                    {...form.register("name")}
                    className="flex-1"
                    placeholder="Enter full name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Label htmlFor="email" className="sm:w-1/4">Email *</Label>
                <div className="flex-1 space-y-2 w-full">
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    className="flex-1"
                    placeholder="Enter email address"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Role Field */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Label htmlFor="role" className="sm:w-1/4">Role *</Label>
                <div className="flex-1 space-y-2 w-full">
                  <Select
                    value={form.watch("role")}
                    onValueChange={(value) => form.setValue("role", value as Staff["role"])}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="TourGuide">Tour Guide</SelectItem>
                      <SelectItem value="Agent">Agent</SelectItem>
                      <SelectItem value="ContentCreator">Content Creator</SelectItem>
                      <SelectItem value="Traveler">Traveler</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.role && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.role.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Optional Fields */}
              {[
                ["phone", "Phone", "tel"],
                ["address", "Address"],
                ["department", "Department"],
                ["joiningDate", "Joining Date", "date"],
                ["notes", "Notes"],
              ].map(([key, label, type]) => (
                <div key={key} className="flex flex-col sm:flex-row gap-4 items-center">
                  <Label htmlFor={key} className="sm:w-1/4">{label}</Label>
                  <div className="flex-1 space-y-2 w-full">
                    <Input
                      id={key}
                      type={type || "text"}
                      {...form.register(key as keyof Staff)}
                      className="flex-1"
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                    {form.formState.errors[key as keyof Staff] && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors[key as keyof Staff]?.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDialogOpen(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : currentStaff ? "Update Staff" : "Create Staff"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
          </DialogHeader>
          {viewStaff && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p>{viewStaff.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{viewStaff.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p>{viewStaff.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{viewStaff.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p>{viewStaff.department || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joining Date</p>
                  <p>{viewStaff.joiningDate || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p>{viewStaff.address || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p>{viewStaff.notes || "-"}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}