// src/app/api/staff/[id]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnectionHandlers';
import { StaffModel, IStaff } from '@/models/staffSetting.model';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const staff = await StaffModel.findById(params.id).lean<IStaff>();
    if (!staff) {
      return NextResponse.json(
        { success: false, message: 'Staff not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        phone: staff.phone,
        address: staff.address,
        department: staff.department,
        joiningDate: staff.joiningDate?.toISOString().split('T')[0],
        notes: staff.notes,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error fetching staff' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const body = await request.json();
    const updatedStaff = await StaffModel.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    ).lean<IStaff>();

    if (!updatedStaff) {
      return NextResponse.json(
        { success: false, message: 'Staff not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedStaff._id,
        name: updatedStaff.name,
        email: updatedStaff.email,
        role: updatedStaff.role,
        phone: updatedStaff.phone,
        address: updatedStaff.address,
        department: updatedStaff.department,
        joiningDate: updatedStaff.joiningDate?.toISOString().split('T')[0],
        notes: updatedStaff.notes,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Error updating staff' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const deletedStaff = await StaffModel.findByIdAndDelete(params.id).lean<IStaff>();
    if (!deletedStaff) {
      return NextResponse.json(
        { success: false, message: 'Staff not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: deletedStaff._id,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error deleting staff' },
      { status: 500 }
    );
  }
}
