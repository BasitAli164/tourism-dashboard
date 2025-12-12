// schemas.ts
import { z } from "zod";

export const ItinerarySchema = z.object({
  day: z.number(),
  title: z.string(),
  description: z.string(),
  accommodation: z.string(),
  meals: z.string(),
  time: z.string(),
  distance: z.number(),
  ascent: z.number(),
  descent: z.number(),
  image: z.string(),
});

export const SeasonalPricingSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  price: z.number(),
});

export const FAQSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const TourSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  price: z.number(),
  duration: z.number(),
  category: z.string(),
  images: z.array(z.string()),
  itineraries: z.array(ItinerarySchema),
  mapIframe: z.string(),
  faqs: z.array(FAQSchema),
  termsAndConditions: z.string(),
  maxGroupSize: z.number(),
  difficultyLevel: z.string(),
  startDates: z.array(z.string()),
  includedServices: z.array(z.string()),
  excludedServices: z.array(z.string()),
  requiredEquipment: z.array(z.string()),
  meetingPoint: z.string(),
  endPoint: z.string(),
  status: z.string(),
  seasonalPricing: z.array(SeasonalPricingSchema),
  relatedTours: z.array(z.string()),
  keywords: z.array(z.string()),
});

export type Itinerary = z.infer<typeof ItinerarySchema>;
export type SeasonalPricing = z.infer<typeof SeasonalPricingSchema>;
export type FAQ = z.infer<typeof FAQSchema>;
export type Tour = z.infer<typeof TourSchema>;