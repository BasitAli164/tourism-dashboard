"use client";

import { useState, useEffect} from "react";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { TourSchema, SortOptionSchema, TourTypes, SortOption } from "@/schemas/tourPageSchema";



const ToursPage: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("title");
  const [tours, setTours] = useState<TourTypes[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

    // Fetch tours from API
    useEffect(() => {
      const fetchTours = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('/api/tours');
          
          if (!response.ok) {
            throw new Error('Failed to fetch tours');
          }
          
          const data = await response.json();
          setTours(data);
        } catch (error) {
          console.error('Error fetching tours:', error);
          toast.error("Failed to load tours");
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchTours();
    }, []);
  

 // Filter and sort tours
 const filteredTours: TourTypes[] = tours
 .filter(
   (tour) =>
     tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     tour.location.toLowerCase().includes(searchTerm.toLowerCase())
 )
 .sort((a, b) => {
   if (sortBy === "price") {
     return a.price - b.price;
   } else if (sortBy === "duration") {
     return a.duration - b.duration;
   } else {
     return a.title.localeCompare(b.title);
   }
 });

if (isLoading) {
 return (
   <div className="container mx-auto p-4 md:p-6 flex justify-center items-center h-64">
     <p>Loading tours...</p>
   </div>
 );
}

const handleDelete = async (id: string) => {  // Changed from number to string
  try {
    const response = await fetch(`/api/tours/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Failed to delete tour');

    setTours(tours.filter(tour => tour._id !== id));
    
    toast.success("Tour Deleted", {
      description: `Tour with ID: ${id} has been deleted.`,
      icon: <Trash2 className="h-5 w-5" />,
      duration: 2000,
    });
  } catch (error) {
    toast.error("Failed to delete tour");
    console.error('Error deleting tour:', error);
  }
};
  return (
    <div className="container mx-auto p-4 md:p-6">
      <Toaster position="top-right" />

      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-[22px] sm:text-3xl font-bold">Tour Packages</h1>
        <Button onClick={() => router.push("/tours/add")} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Tour
        </Button>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        {/* Search Input */}
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>

        {/* Sort Select */}
        <Select value={sortBy} onValueChange={(value) => setSortBy(SortOptionSchema.parse(value))}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Sort by Title</SelectItem>
            <SelectItem value="price">Sort by Price</SelectItem>
            <SelectItem value="duration">Sort by Duration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-gray-100 dark:bg-gray-800">
              <TableHead className="p-3">Title</TableHead>
              <TableHead className="p-3">Location</TableHead>
              <TableHead className="p-3">Price</TableHead>
              <TableHead className="p-3">Duration (days)</TableHead>
              <TableHead className="p-3 hidden sm:table-cell">Category</TableHead>
              <TableHead className="p-3">Status</TableHead>
              <TableHead className="p-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTours.map((tour) => (
              <TableRow key={tour._id} className="border-b">
                <TableCell className="p-3">{tour.title}</TableCell>
                <TableCell className="p-3">{tour.location}</TableCell>
                <TableCell className="p-3">${tour.price}</TableCell>
                <TableCell className="p-3">{tour.duration}</TableCell>
                <TableCell className="p-3 hidden sm:table-cell">{tour.category}</TableCell>
                <TableCell className="p-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      tour.status === "Published"
                        ? "bg-green-100 text-green-800"
                        : tour.status === "Archived"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {tour.status}
                  </span>
                </TableCell>
                <TableCell className="p-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => router.push(`/tours/${tour._id}`)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => router.push(`/tours/edit/${tour._id}`)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDelete(tour._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
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

export default ToursPage;
