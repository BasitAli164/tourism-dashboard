import dbConnect from "@/utils/dbConnectionHandlers";
import adminModel from "@/models/admin.model";
import { errorHandler } from "@/utils/errorHandler";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const POST = async (req: Request) => {
  await dbConnect();
  try {
    const { name, email, password } = await req.json();

    //Check if user exists

    const exists = await adminModel.findOne({ email });
    if (exists) {
      return NextResponse.json(
        { error: "Admin already exists" },
        { status: 409 }
      );
    }

    //Hash password

    const hashedPassword = await bcrypt.hash(password, 10);

    //Create admin
    const admin = await adminModel.create({
      email,
      name,
      password: hashedPassword,
    });

    return NextResponse.json({ message: "Admin Detail:", data: admin }, {status:201,statusText:"Admin created successfully...."});
  } catch (err) {
    return errorHandler({
      error: err,
      message: "Something went wronge",
      status: 500,
      statusText: "Internal Server Error",
    });
  }
};
