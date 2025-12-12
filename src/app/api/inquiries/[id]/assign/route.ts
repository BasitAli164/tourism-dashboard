import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnectionHandlers';
import inqueryModel from '@/models/inquery.model';

export const PATCH = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const { assignedTo } = await req.json();
    
    await dbConnect();
    
    const updatedInquiry = await inqueryModel.findByIdAndUpdate(
      params.id,
      { assignedTo },
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
      { error: `Failed to assign agent${error}` },
      { status: 500 }
    );
  }
};