"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { Plus, Minus, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toaster, toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/date-picker";
import {
  tourEditFormSchema as tourAddFormSchema,
  FormValuesEditForm as FormValuesAddForm,
} from "@/schemas/tourEditFormSchema";

export default function AddTourPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<FormValuesAddForm>({
    resolver: zodResolver(tourAddFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      price: 0,
      duration: 1,
      category: "",
      images: [],
      itineraries: [
        {
          day: 1,
          title: "",
          description: "",
          accommodation: "",
          meals: "",
          time: "",
          distance: 0,  // Add default value
          ascent: 0,    // Add default value
          descent: 0    // Add default value
        },
      ],
      mapIframe: "",
      faqs: [{ question: "", answer: "" }],
      termsAndConditions: "",
      maxGroupSize: 1,
      difficultyLevel: "Easy",
      startDates: [],
      includedServices: [],
      excludedServices: [],
      requiredEquipment: [],
      meetingPoint: "",
      endPoint: "",
      status: "draft",
      seasonalPricing: [],
      relatedTours: [],
      keywords: [],
    },
  });

  const {
    fields: itineraryFields,
    append: appendItinerary,
    remove: removeItinerary,
  } = useFieldArray({
    control: form.control,
    name: "itineraries",
  });

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  const {
    fields: seasonalPricingFields,
    append: appendSeasonalPricing,
    remove: removeSeasonalPricing,
  } = useFieldArray({
    control: form.control,
    name: "seasonalPricing",
  });

  const {
    fields: includedServicesFields,
    append: appendIncludedService,
    remove: removeIncludedService,
  } = useFieldArray({
    control: form.control,
    name: "includedServices",
  });

  const {
    fields: excludedServicesFields,
    append: appendExcludedService,
    remove: removeExcludedService,
  } = useFieldArray({
    control: form.control,
    name: "excludedServices",
  });

  const {
    fields: keywordsFields,
    append: appendKeyword,
    remove: removeKeyword,
  } = useFieldArray({
    control: form.control,
    name: "keywords",
  });
  const onSubmit: SubmitHandler<FormValuesAddForm> = async (values) => {
    console.log("Form submission started");
    setIsLoading(true);
  
    try {
      // ✅ Convert comma-separated relatedTours string (if it's a string) into an array
      if (typeof values.relatedTours === "string") {
        values.relatedTours = values.relatedTours
          .split(",")
          .map((id: string) => id.trim())
          .filter((id: string) => id !== "");
      }
      
      // Step 1: Upload images if they exist
      let imageUrls: string[] = [];
      if (values.images && values.images.length > 0) {
        const formData = new FormData();
        
        // Append each file to FormData
        values.images.forEach((file) => {
          if (file instanceof File) { // Ensure it's a File object
            formData.append("images", file);
          }
        });
  
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData, // No headers needed for FormData
        });
  
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload images");
        }
  
        const uploadData = await uploadResponse.json();
        imageUrls = uploadData.urls; // ✅ Corrected from 'files' to 'urls'
      }
  
      // Step 2: Submit tour data with image URLs
      const tourData = {
        ...values,
        images: imageUrls, // Replace File[] with string[] (uploaded paths)
      };
  
      const response = await fetch("/api/tours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tourData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to create tour");
      }
  
      const responseData = await response.json();
      console.log("Tour created:", responseData);
  
      toast.success("Tour Created", {
        description: "The tour has been successfully created.",
        duration: 2000,
        icon: <CheckCircle className="h-5 w-5" />,
      });
  
      router.push("/tours");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create tour. Please try again later.", {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />
      <h1 className="mb-6 text-3xl font-bold">Add New Tour</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter tour title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter tour description"
                    {...field}
                    rows={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter tour location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter tour price"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter tour duration"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mountaineering">
                      Mountaineering
                    </SelectItem>
                    <SelectItem value="trekking">Trekking</SelectItem>
                    <SelectItem value="skiing">Skiing</SelectItem>
                    <SelectItem value="expedition">Expedition</SelectItem>
                    <SelectItem value="rock-climbing">Rock Climbing</SelectItem>
                    <SelectItem value="mountain-biking">
                      Mountain Biking
                    </SelectItem>
                    <SelectItem value="cultural-tour">Cultural Tour</SelectItem>
                    <SelectItem value="hunting">Hunting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
<FormField
  control={form.control}
  name="images"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Images</FormLabel>
      <FormControl>
        <Input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) {
              const files = Array.from(e.target.files);
              field.onChange(files); // Store File[] in form state
            }
          }}
        />
      </FormControl>
      <FormDescription>Upload tour images (max 10)</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

          <Accordion
            type="single"
            collapsible
            className="w-full border rounded-md"
          >
            <AccordionItem value="itineraries">
              <AccordionTrigger className="px-4">Itineraries</AccordionTrigger>
              <AccordionContent className="px-4">
                {itineraryFields.map((field, index) => (
                  <div key={field.id} className="border p-4 mb-4 rounded-md">
                    <FormField
                      control={form.control}
                      name={`itineraries.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Day {index + 1} Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itineraries.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itineraries.${index}.accommodation`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accommodation</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itineraries.${index}.meals`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meals</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itineraries.${index}.time`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itineraries.${index}.distance`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Distance (km)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itineraries.${index}.ascent`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ascent (m)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itineraries.${index}.descent`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descent (m)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                   
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItinerary(index)}
                      className="mt-2"
                    >
                      <Minus className="h-4 w-4 mr-2" /> Remove Day
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendItinerary({
                      day: itineraryFields.length + 1,
                      title: "",
                      description: "",
                      accommodation: "",
                      meals: "",
                      time: "",
                      distance: 0,
                      ascent: 0,
                      descent: 0,
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Day
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <FormField
            control={form.control}
            name="mapIframe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Map (Google Maps iframe)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste Google Maps iframe code here"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter the iframe code for the Google Maps location
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Accordion
            type="single"
            collapsible
            className="w-full border rounded-md"
          >
            <AccordionItem value="faqs">
              <AccordionTrigger className="px-4">FAQs</AccordionTrigger>
              <AccordionContent className="px-4">
                {faqFields.map((field, index) => (
                  <div key={field.id} className="border p-4 mb-4 rounded-md">
                    <FormField
                      control={form.control}
                      name={`faqs.${index}.question`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`faqs.${index}.answer`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Answer</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFaq(index)}
                      className="mt-2"
                    >
                      <Minus className="h-4 w-4 mr-2" /> Remove FAQ
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendFaq({ question: "", answer: "" })}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add FAQ
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <FormField
            control={form.control}
            name="termsAndConditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terms and Conditions</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={10} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ... (remaining form fields) ... */}

          <FormField
            control={form.control}
            name="maxGroupSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Group Size</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficultyLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Challenging">Challenging</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDates"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Dates</FormLabel>
                <FormControl>
                  <DatePicker
                    mode="multiple"
                    selected={field.value}
                    onChange={(dates: Date[]) => field.onChange(dates)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Accordion
            type="single"
            collapsible
            className="w-full border rounded-md"
          >
            <AccordionItem value="includedServices">
              <AccordionTrigger className="px-4">
                Included Services
              </AccordionTrigger>
              <AccordionContent className="px-4">
                {includedServicesFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center space-x-2 mb-2"
                  >
                    <FormField
                      control={form.control}
                      name={`includedServices.${index}.value`} // Target the value inside the object
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeIncludedService(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendIncludedService({ value: "" })}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Included Service
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion
            type="single"
            collapsible
            className="w-full border rounded-md"
          >
            <AccordionItem value="excludedServices">
              <AccordionTrigger className="px-4">
                Excluded Services
              </AccordionTrigger>
              <AccordionContent className="px-4">
                {excludedServicesFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center space-x-2 mb-2"
                  >
                    <FormField
                      control={form.control}
                      name={`excludedServices.${index}.value`} // ✅ Corrected to match schema
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeExcludedService(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendExcludedService({ value: "" })} // ✅ Append as object, not string
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Excluded Service
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <FormField
            control={form.control}
            name="requiredEquipment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Equipment</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter required equipment (one per line)"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.split("\n"))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meetingPoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting Point</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endPoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Point</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Accordion
            type="single"
            collapsible
            className="w-full border rounded-md bg-gray-50"
          >
            <AccordionItem value="seasonalPricing">
              <AccordionTrigger className="px-4 hover:bg-gray-100">
                Seasonal Pricing
              </AccordionTrigger>
              <AccordionContent className="px-4">
                {seasonalPricingFields.map((field, index) => (
                  <div key={field.id} className="border p-4 mb-4 rounded-md">
                    <FormField
                      control={form.control}
                      name={`seasonalPricing.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              mode="single"
                              selected={field.value}
                              onChange={(date: Date | undefined) =>
                                field.onChange(date)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`seasonalPricing.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              mode="single"
                              selected={field.value}
                              onChange={(date: Date | undefined) =>
                                field.onChange(date)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`seasonalPricing.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSeasonalPricing(index)}
                      className="mt-2"
                    >
                      <Minus className="h-4 w-4 mr-2" /> Remove Seasonal Price
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendSeasonalPricing({
                      startDate: new Date(),
                      endDate: new Date(),
                      price: 0,
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Seasonal Price
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <FormField
            control={form.control}
            name="relatedTours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Tours</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter related tour IDs (comma-separated)"
                  />
                </FormControl>
                <FormDescription>
                  Enter the IDs of related tours, separated by commas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Accordion
            type="single"
            collapsible
            className="w-full border rounded-md"
          >
            <AccordionItem value="keywords">
              <AccordionTrigger className="px-4">Keywords</AccordionTrigger>
              <AccordionContent className="px-4">
                {keywordsFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center space-x-2 mb-2"
                  >
                    <FormField
                      control={form.control}
                      name={`keywords.${index}.value`} // ✅ Corrected to match schema
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeKeyword(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendKeyword({ value: "" })} // ✅ Append as object, not string
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Keyword
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button
            type="submit"
            disabled={isLoading}
            onClick={() => {
              console.log("Button clicked");
              console.log("Form valid:", form.formState.isValid);
              console.log("Errors:", form.formState.errors);
            }}
          >
            {isLoading ? "Creating..." : "Create Tour"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
