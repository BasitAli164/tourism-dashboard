import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnectionHandlers";
import inqueryModel from "@/models/inquery.model";
  

  

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
        { error: `Failed to delete inquiry ${error}` },
        { status: 500 }
      );
    }
  };
  