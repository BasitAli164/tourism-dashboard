import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOption } from '../../auth/[...nextauth]/option';
import multerUpload from '@/utils/multer';
import dbConnect from '@/utils/dbConnectionHandlers';
import AdminModel from '@/models/admin.model';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOption);

    if (!session?.user?._id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    // Save avatar path in DB
    const avatarUrl = `/uploads/${filename}`;

    await AdminModel.findByIdAndUpdate(session.user._id, { avatar: avatarUrl });

    return NextResponse.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: avatarUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
