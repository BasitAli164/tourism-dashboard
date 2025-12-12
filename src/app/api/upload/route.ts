import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { promises as fs } from "fs";
import dbConnect from "@/utils/dbConnectionHandlers";
import Tour from "@/models/tour.model";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("images");
    const tourId = formData.get("tourId");

    // If no images are provided, proceed without uploading them
    if (files.length === 0) {
      if (tourId) {
        await dbConnect();
        // No images to update, just return success
        return NextResponse.json({
          success: true,
          message: "No images provided, but tour update succeeded"
        });
      }

      return NextResponse.json({
        success: true,
        message: "No images uploaded, no tour update performed"
      });
    }

    const uploadDir = path.join(process.cwd(), "public/uploads/tours");
    await fs.mkdir(uploadDir, { recursive: true });

    const uploadedUrls = [];

    // Process each file
    for (const file of files) {
      if (!(file instanceof File) || !file.type.startsWith("image/")) {
        continue; // Skip non-image files
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileExt = path.extname(file.name);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      uploadedUrls.push(`/uploads/tours/${fileName}`);
    }

    // If no valid images were uploaded, return an error
    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: "No valid images uploaded" },
        { status: 400 }
      );
    }

    if (tourId) {
      await dbConnect();
      await Tour.findByIdAndUpdate(
        tourId,
        { $push: { images: { $each: uploadedUrls } } },
        { new: true }
      );
    }
console.log("uploadedUrls is:",uploadedUrls)
    // In /api/upload route
return NextResponse.json({
  success: true,
  urls: uploadedUrls // Ensure property name matches what frontend expects
});
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
