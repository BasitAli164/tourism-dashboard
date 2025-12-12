import mongoose, { Document, Model, Schema, models } from "mongoose";

// 1. Define TypeScript Interfaces
interface ItineraryItem {
  day: number;
  title: string;
  description: string;
  accommodation: string;
  meals: string;
  time: string;
  distance?: number;  // Add this line
  ascent?: number;    // Add this line
  descent?: number;   // Add this line
}

interface FAQItem {
  question: string;
  answer: string;
}

interface SeasonalPricing {
  startDate: Date;
  endDate: Date;
  price: number;
}

interface TourDocument extends Document {
  title: string;
  description: string;
  location: string;
  price: number;
  duration: number;
  category: string;
  images?: string[];
  itineraries: ItineraryItem[];
  mapIframe: string;
  faqs: FAQItem[];
  termsAndConditions: string;
  maxGroupSize: number;
  difficultyLevel: "Easy" | "Medium" | "Hard";
  startDates: Date[];
  includedServices: string[];
  excludedServices: string[];
  requiredEquipment: string[];
  meetingPoint: string;
  endPoint: string;
  status: "Draft" | "Published" | "Archived";
  seasonalPricing: SeasonalPricing[];
  relatedTours: mongoose.Types.ObjectId[];
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 2. Define Mongoose Schema
const tourSchema: Schema<TourDocument> = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      required: true,
    },
    images: [{ type: String }], // Array of image URLs
    itineraries: [
      {
        day: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        accommodation: {
          type: String,
        },
        meals: {
          type: String,
        },
        time: {
          type: String,
        },
        distance: {
          type: Number,   // Optional field for distance
          required: false, // This makes it optional
        },
        ascent: {
          type: Number,   // Optional field for ascent
          required: false, // This makes it optional
        },
        descent: {
          type: Number,   // Optional field for descent
          required: false, // This makes it optional
        },
       
      },
    ],
    
    mapIframe: {
      type: String,
    }, // Google Maps iframe HTML
    faqs: [
      {
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
      },
    ],
    termsAndConditions: {
      type: String,
    },
    maxGroupSize: {
      type: Number,
      default: 1,
    },
    difficultyLevel: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    startDates: [{ type: Date }],
    includedServices: [{ type: String }], // e.g., ["Hotel", "Meals"]
    excludedServices: [{ type: String }], // e.g., ["Flights", "Visa"]
    requiredEquipment: [{ type: String }], // e.g., ["Hiking Boots", "Jacket"]
    meetingPoint: {
      type: String,
    },
    endPoint: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
    seasonalPricing: [
      {
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    relatedTours: [{ type: Schema.Types.ObjectId, ref: "Tour" }], // Reference to other tours
    keywords: [{ type: String }], // SEO keywords
  },
  { timestamps: true } // Auto-add `createdAt` and `updatedAt`
);

// 3. Create/Get Model
const Tour: Model<TourDocument> =
  models.Tour || mongoose.model<TourDocument>("Tour", tourSchema);

export default Tour;
