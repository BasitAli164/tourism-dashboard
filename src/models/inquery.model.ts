import mongoose, { Schema, Document, model, models } from "mongoose";

// Interface for response to inquiry
export interface IInquiryResponse {
  message: string;
  respondedBy: mongoose.Types.ObjectId; // Changed to ObjectId
  respondedAt: Date;
}

// Interface for main Inquiry document
export interface IInquiry extends Document {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "Pending" | "In_Progress" | "Resolved" | "Closed";
  priority: "Low" | "Normal" | "High" | "Urgent";
  userId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  responses: IInquiryResponse[];
  createdAt: Date;
  updatedAt: Date;
  customer?: any; // virtual field (populated from userId)
}

// Response schema
const InquiryResponseSchema: Schema<IInquiryResponse> = new Schema<IInquiryResponse>({
  message: {
    type: String,
    required: true,
  },
  respondedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  respondedAt: {
    type: Date,
    default: Date.now,
  },
});

// Main inquiry schema
const InquirySchema: Schema<IInquiry> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In_Progress", "Resolved", "Closed"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Urgent"],
      default: "Normal",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    responses: [InquiryResponseSchema],
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Virtual for customer info
InquirySchema.virtual("customer", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

// Export the model (singleton pattern)
export default models.Inquiry || model<IInquiry>("Inquiry", InquirySchema);