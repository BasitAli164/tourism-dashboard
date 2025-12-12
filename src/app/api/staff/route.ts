import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnectionHandlers';
import { StaffModel } from '@/models/staffSetting.model';
import type { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'name';

    let query = {};
    if (search) {
      query = { $text: { $search: search } };
    }

    const staff = await StaffModel.find(query)
      .sort({ [sortBy]: 1 })
      .lean();

    const result = staff.map((s) => ({
      id: s._id,
      name: s.name,
      email: s.email,
      role: s.role,
      phone: s.phone || '',
      address: s.address || '',
      department: s.department || '',
      joiningDate: s.joiningDate?.toISOString().split('T')[0] || '',
      notes: s.notes || '',
    }));

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Error fetching staff${error}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.role) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    const newStaff = await StaffModel.create(body);

    return NextResponse.json({
      success: true,
      data: {
        id: newStaff._id.toString(),
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        phone: newStaff.phone || '',
        address: newStaff.address || '',
        department: newStaff.department || '',
        joiningDate: newStaff.joiningDate?.toISOString().split('T')[0] || '',
        notes: newStaff.notes || '',
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
      { success: false, message: error.message || 'Error creating staff' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const { id } = params;
    const body = await request.json();
    
    const updatedStaff = await StaffModel.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedStaff) {
      return NextResponse.json(
        { success: false, message: 'Staff not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedStaff._id.toString(),
        name: updatedStaff.name,
        email: updatedStaff.email,
        role: updatedStaff.role,
        phone: updatedStaff.phone || '',
        address: updatedStaff.address || '',
        department: updatedStaff.department || '',
        joiningDate: updatedStaff.joiningDate?.toISOString().split('T')[0] || '',
        notes: updatedStaff.notes || '',
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
      { success: false, message: error.message || 'Error updating staff' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const { id } = params;
    const deletedStaff = await StaffModel.findByIdAndDelete(id);
    
    if (!deletedStaff) {
      return NextResponse.json(
        { success: false, message: 'Staff not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Staff deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Error deleting staff${error}` },
      { status: 500 }
    );
  }
}