"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { Plus, Minus, CheckCircle, XCircle } from "lucide-react";
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
import { TipTapEditor } from "@/components/tiptap-editor";
import {
  tourEditFormSchema,
  FormValuesEditForm,
} from "@/schemas/tourEditFormSchema";

export default function EditTourPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { id } = useParams<{ id: string }>();
  const form = useForm<FormValuesEditForm>({
    resolver: zodResolver(tourEditFormSchema),
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
          distance:0,
          ascent:0,
          descent:0
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

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/tours/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tour data");
        }
        const tourData = await response.json();

        // Transform data to match form structure
        const formattedData = {
          ...tourData,
          includedServices: tourData.includedServices.map(
            (service: string) => ({ value: service })
          ),
          excludedServices: tourData.excludedServices.map(
            (service: string) => ({ value: service })
          ),
          keywords: tourData.keywords.map((keyword: string) => ({
            value: keyword,
          })),
          relatedTours: tourData.relatedTours,
          startDates: tourData.startDates.map((date: string) => new Date(date)),
          seasonalPricing: tourData.seasonalPricing.map((sp: any) => ({
            ...sp,
            startDate: new Date(sp.startDate),
            endDate: new Date(sp.endDate),
          })),
          itineraries: tourData.itineraries.map((it: any) => ({
            ...it,
            distance: it.distance || 0,
            ascent: it.ascent || 0,
            descent: it.descent || 0,
          })),
        };

        form.reset(formattedData);
      } catch (error) {
        toast.error("Error loading tour", {
          description: "Could not fetch tour data. Please try again.",
          icon: <XCircle className="h-5 w-5" />,
        });
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTourData();
  }, [form, id]);

  const { control } = form;

  const {
    fields: itineraryFields,
    append: appendItinerary,
    remove: removeItinerary,
  } = useFieldArray<FormValuesEditForm, "itineraries">({
    control,
    name: "itineraries",
  });

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray<FormValuesEditForm, "faqs">({
    control,
    name: "faqs",
  });

  const {
    fields: seasonalPricingFields,
    append: appendSeasonalPricing,
    remove: removeSeasonalPricing,
  } = useFieldArray<FormValuesEditForm, "seasonalPricing">({
    control,
    name: "seasonalPricing",
  });

  const {
    fields: includedServicesFields,
    append: appendIncludedService,
    remove: removeIncludedService,
  } = useFieldArray<FormValuesEditForm, "includedServices">({
    control,
    name: "includedServices",
  });

  const {
    fields: excludedServicesFields,
    append: appendExcludedService,
    remove: removeExcludedService,
  } = useFieldArray<FormValuesEditForm, "excludedServices">({
    control,
    name: "excludedServices",
  });

  const {
    fields: keywordsFields,
    append: appendKeyword,
    remove: removeKeyword,
  } = useFieldArray<FormValuesEditForm, "keywords">({
    control,
    name: "keywords",
  });
  async function uploadImages(files: File[], tourId: string) {
    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("images", file); // Attach image files
      });

      formData.append("tourId", tourId); // Attach the tourId

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData, // Don't manually set Content-Type for FormData
      });

      if (!response.ok) throw new Error("Image upload failed");
      return await response.json();
    } catch (error) {
      console.error("Upload error:", error);
      return [];
    }
  }

  const onSubmit: SubmitHandler<FormValuesEditForm> = async (values) => {
    try {
      const isValid = await form.trigger();
      if (!isValid) {
        toast.error("Validation Error");
        return;
      }
  
      setIsLoading(true);
  
      // Handle image uploads
      const imageFiles = values.images?.filter((f) => f instanceof File) ?? [];
      const existingImages =
        values.images?.filter((img) => typeof img === "string") ?? [];
  
      // Upload new images only
      const uploadedImages = await uploadImages(imageFiles, id);
  
      // ✅ Updated: combine existing + new image paths correctly
      const allImages = [
        ...existingImages,
        ...(uploadedImages.files?.map((file: any) => file.path) || []),
      ];
  
      const payload = {
        ...values,
        images: allImages,
        includedServices:
          values.includedServices?.map((item) => item.value) || [],
        excludedServices:
          values.excludedServices?.map((item) => item.value) || [],
        keywords: values.keywords?.map((item) => item.value) || [],
        relatedTours: Array.isArray(values.relatedTours)
          ? values.relatedTours.map((id: string) => id.trim())
          : values.relatedTours
          ? [values.relatedTours.trim()]
          : [],
        startDates: values.startDates?.map((date) => date.toISOString()) || [],
        seasonalPricing:
          values.seasonalPricing?.map((sp) => ({
            ...sp,
            startDate: sp.startDate?.toISOString(),
            endDate: sp.endDate?.toISOString(),
          })) || [],
      };
  
      const response = await fetch(`/api/tours/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update tour");
      }
  
      // Success handling
      toast.success("Tour updated successfully", {
        icon: <CheckCircle className="h-5 w-5" />,
      });
      // router.push(`/tours/${id}`); // Redirect to tour page
      router.push(`/tours`); // Redirect to tour page
    } catch (error) {
      toast.error("Error updating tour", {
        description:
          error instanceof Error ? error.message : "Please try again.",
        icon: <XCircle className="h-5 w-5" />,
      });
      console.error("Update error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" />
      <h1 className="mb-6 text-3xl font-bold">Edit Tour</h1>

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
                      const files = Array.from(e.target.files || []);
                      // ✅ Preserve existing URLs and add new files
                      field.onChange([...(field.value || []), ...files]);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  {field.value?.length}/5 images (Max 2MB each)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Accordion
            type="single"
            collapsible
            className="w-full border rounded-md bg-gray-50"
          >
            <AccordionItem value="itineraries">
              <AccordionTrigger className="px-4 hover:bg-gray-100">
                Itineraries
              </AccordionTrigger>
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
            className="w-full border rounded-md bg-gray-50"
          >
            <AccordionItem value="faqs">
              <AccordionTrigger className="px-4 hover:bg-gray-100">
                FAQs
              </AccordionTrigger>
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
                  <TipTapEditor
                    content={field.value}
                    onSave={(value) => field.onChange(value)} // Adjusting to expected prop
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
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
            className="w-full border rounded-md bg-gray-50"
          >
            <AccordionItem value="includedServices">
              <AccordionTrigger className="px-4 hover:bg-gray-100">
                Included Services
              </AccordionTrigger>
              <AccordionContent className="px-4">
                {includedServicesFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center space-x-2 mb-2"
                  >
                    // Update your includedServices field render:
                    <FormField
                      control={form.control}
                      name={`includedServices.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage /> {/* Add this line */}
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
                  onClick={() => appendIncludedService({ value: "" })} // ✅ Now appending an object instead of a string
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Included Service
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion
            type="single"
            collapsible
            className="w-full border rounded-md bg-gray-50"
          >
            <AccordionItem value="excludedServices">
              <AccordionTrigger className="px-4 hover:bg-gray-100">
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
                      name={`excludedServices.${index}.value`} // ✅ Updated to access the `value` key inside the object
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
                  onClick={() => appendExcludedService({ value: "" })} // ✅ Appending an object instead of a string
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
                    value={
                      Array.isArray(field.value)
                        ? field.value.join(", ")
                        : field.value
                        ? field.value
                        : ""
                    }
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(",")
                          .map((id) => id.trim())
                          .filter((id) => id.length > 0)
                      )
                    }
                    placeholder="Enter related tour IDs (comma-separated)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Accordion
            type="single"
            collapsible
            className="w-full border rounded-md bg-gray-50"
          >
            <AccordionItem value="keywords">
              <AccordionTrigger className="px-4 hover:bg-gray-100">
                Keywords
              </AccordionTrigger>
              <AccordionContent className="px-4">
                {keywordsFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center space-x-2 mb-2"
                  >
                    <FormField
                      control={form.control}
                      name={`keywords.${index}.value`} // ✅ Updated to access the `value` key inside the object
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
                  onClick={() => appendKeyword({ value: "" })} // ✅ Appending an object instead of a string
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Keyword
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button type="submit" disabled={isLoading || !form.formState.isValid}>
            {isLoading ? "Updating..." : "Update Tour"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
