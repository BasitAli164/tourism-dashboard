import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnectionHandlers";
import inqueryModel from "@/models/inquery.model";
import type { IInquiry } from "@/models/inquery.model";
import mongoose, { Types } from "mongoose";

// Define the populated customer type
interface PopulatedCustomer {
    _id: Types.ObjectId;
    name: string;
    email: string;
  }
  
  // Extend the IInquiry interface for population
  interface PopulatedInquiry extends Omit<IInquiry, "customer" | "assignedTo"> {
    customer?: PopulatedCustomer | Types.ObjectId;
    assignedTo?: Types.ObjectId;
  }
  

  export const DELETE = async (
    req: Request,
    { params }: { params: { id: string } }
  ) => {
    try {
      await dbConnect();
  
      const deletedInquiry = await inqueryModel.findByIdAndDelete(params.id);
  
      if (!deletedInquiry) {
        return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
      }
  
      return NextResponse.json(
        { message: "Inquiry deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to delete inquiry" },
        { status: 500 }
      );
    }
  };
  