import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOption } from '../../auth/[...nextauth]/option';
import AdminModel from '@/models/admin.model';
import dbConnect from '@/utils/dbConnectionHandlers';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOption);
    
    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const admin = await AdminModel.findById(session.user._id).select('-password');
    
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        name: admin.name,
        email: admin.email,
        avatar: admin.avatar
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOption);
    const body = await request.json();

    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updateData: any = {
      name: body.name,
      email: body.email
    };

    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    const updatedAdmin = await AdminModel.findByIdAndUpdate(
      session.user._id,
      updateData,
      { new: true }
    ).select('-password');

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedAdmin
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}