// /api/tours/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnectionHandlers";
import Tour from "@/models/tour.model";
import mongoose from "mongoose";
import { errorHandler } from "@/utils/errorHandler";

export async function POST(req: Request) {
  try {
    // 🔌 Connect to MongoDB
    await dbConnect();

    // 📦 Parse incoming JSON data from the request body
    const body = await req.json();

    // 🧺 Destructure fields from the request body
    let {
      title,
      description,
      location,
      price,
      duration,
      category,
      images,
      itineraries,
      mapIframe,
      faqs,
      termsAndConditions,
      maxGroupSize,
      difficultyLevel,
      startDates,
      includedServices,
      excludedServices,
      requiredEquipment,
      meetingPoint,
      endPoint,
      status,
      seasonalPricing,
      relatedTours = [],
      keywords,
    } = body;

    // ✅ Normalize `images` array (convert objects to image paths)
    if (Array.isArray(images)) {
      images = images
        .map((img: any) =>
          typeof img === "string" ? img : img?.path
        )
        .filter(Boolean);
    } else {
      images = [];
    }

    // 🔁 Normalize react-select or custom structured array values
    includedServices = includedServices?.map(
      (item: any) => item?.value || item
    );
    excludedServices = excludedServices?.map(
      (item: any) => item?.value || item
    );
    requiredEquipment = requiredEquipment?.map(
      (item: any) => item?.value || item
    );
    keywords = keywords?.map((item: any) => item?.value || item);

    // 🔄 Handle relatedTours (convert to ObjectId[])
    if (typeof relatedTours === "string") {
      relatedTours = relatedTours.split(",").map((id) => id.trim());
    } else if (!Array.isArray(relatedTours)) {
      relatedTours = [];
    }

    relatedTours = relatedTours
      .map((id: string): mongoose.Types.ObjectId | null => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch (err) {
          console.warn(`Invalid relatedTour ID: ${id}`);
          return null;
        }
      })
      .filter((id: mongoose.Types.ObjectId | null): id is mongoose.Types.ObjectId => id !== null);

    // 🔐 Validate difficultyLevel
    const allowedDifficulties = ["Easy", "Medium", "Hard"];
    if (!allowedDifficulties.includes(difficultyLevel)) {
      difficultyLevel = "Easy";
    }
    const allowedStatus=["Draft", "Published", "Archived"];
    if(!allowedStatus.includes(status)){
      status="Draft"
    }

    // 🆕 Create a new Tour document
    const addNewTour = new Tour({
      title,
      description,
      location,
      price,
      duration,
      category,
      images,
      itineraries,
      mapIframe,
      faqs,
      termsAndConditions,
      maxGroupSize,
      difficultyLevel,
      startDates,
      includedServices,
      excludedServices,
      requiredEquipment,
      meetingPoint,
      endPoint,
      status,
      seasonalPricing,
      relatedTours,
      keywords,
    });

    // 💾 Save to the database
    await addNewTour.save();
    console.log(addNewTour)

    // 📤 Respond with success
    return NextResponse.json(
      { message: "Tour created successfully", tour: addNewTour },
      { status: 201 }
    );
  } catch (error) {
    // ❌ Handle and respond to errors
    console.error("Tour creation error:", error);
    return errorHandler({
      error,
      message: "Failed to create tour",
      status: 500,
      statusText: "Internal Server Error",
    });
  }
}
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // 🎯 Fetch only selected fields for all tours
    const tours = await Tour.find({}, "title location price duration category status");

    return NextResponse.json(tours, {
      status: 200,
      statusText: "Tours fetched successfully",
    });
  } catch (error) {
    console.error("Home Tour Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tours" },
      { status: 500, statusText: "Server Error" }
    );
  }
}
