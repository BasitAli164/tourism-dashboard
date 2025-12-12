import {z} from 'zod'
export const addTourSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  location: z.string().min(2, { message: "Location must be at least 2 characters." }),
  price: z.number().min(0, { message: "Price must be a positive number." }),
  duration: z.number().min(1, { message: "Duration must be at least 1 day." }),
  category: z.string({ required_error: "Please select a tour category." }),
  images: z.array(z.instanceof(File)).min(1, { message: "At least one image is required." }),
  itineraries: z
    .array(
      z.object({
        day: z.number(),
        title: z.string().min(2, "Title must be at least 2 characters."),
        description: z.string().min(10, "Description must be at least 10 characters."),
        accommodation: z.string(),
        meals: z.string(),
        time: z.string(),
        distance: z.number().optional(),
        ascent: z.number().optional(),
        descent: z.number().optional(),
        image: z.instanceof(File).optional(),
      }),
    )
    .min(1, { message: "At least one itinerary item is required." }),
  mapIframe: z.string().optional(),
  faqs: z.array(
    z.object({
      question: z.string().min(2, "Question must be at least 2 characters."),
      answer: z.string().min(2, "Answer must be at least 2 characters."),
    }),
  ),
  termsAndConditions: z.string().min(10, { message: "Terms and conditions must be at least 10 characters." }),
  maxGroupSize: z.number().min(1, { message: "Max group size must be at least 1." }),
  difficultyLevel: z.enum(["Easy", "Moderate", "Challenging"]),
  startDates: z.array(z.date()),
  includedServices: z.array(z.string()),
  excludedServices: z.array(z.string()),
  requiredEquipment: z.array(z.string()),
  meetingPoint: z.string().min(2, { message: "Meeting point must be at least 2 characters." }),
  endPoint: z.string().min(2, { message: "End point must be at least 2 characters." }),
  status: z.enum(["draft", "published", "archived"]),
  seasonalPricing: z
    .array(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        price: z.number().min(0),
      }),
    )
    .optional(),
  relatedTours: z.array(z.string()).optional(),
  keywords: z.array(z.string()),
})
export type FormValues = z.infer<typeof addTourSchema>;