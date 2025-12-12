import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnectionHandlers';
import inqueryModel from '@/models/inquery.model';

const validStatuses = ["Pending", "In_Progress", "Resolved", "Closed"];

export const PATCH = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const { status } = await req.json();
    
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    await dbConnect();

    console.log("paramas id in status",params.id)
    
    const updatedInquiry = await inqueryModel.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!updatedInquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedInquiry);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
};