import mongoose, { Document, Schema } from "mongoose";

interface AdminDocument extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema: Schema<AdminDocument> = new Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: [5, "Name must be at least 5 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/.+\@.+\..+/, "Please use a valid email address"],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const AdminModel = mongoose.models.Admin || mongoose.model<AdminDocument>("Admin", adminSchema);
export default AdminModel;