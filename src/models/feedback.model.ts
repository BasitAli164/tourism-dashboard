import mongoose, { Schema, Document, model, models } from "mongoose";
import "./user.model"; // adjust path as needed

export interface IFeedbackResponse {
  _id: mongoose.Types.ObjectId;
  message: string;
  respondedBy: mongoose.Types.ObjectId | any; // Populated user
  respondedAt: Date;
}

export interface IFeedback extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId | any; // Populated user
  message: string;
  date: Date;
  status: "Pending" | "Approved" | "Rejected";
  category: "General" | "Bug" | "Feature Request" | "Performance" | string;
  responses: IFeedbackResponse[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema for individual response
const FeedbackResponseSchema: Schema<IFeedbackResponse> = new Schema({
  message: { type: String, required: true },
  respondedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  respondedAt: { type: Date, default: Date.now },
});

// Feedback schema
const FeedbackSchema: Schema<IFeedback> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    category: {
      type: String,
      enum: ["General", "Bug", "Feature Request", "Performance"],
      default: "General",
    },
    responses: [FeedbackResponseSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to populate full user details if needed
FeedbackSchema.virtual("customer", {
  ref: "User",
  localField: "user",
  foreignField: "_id",
  justOne: true,
});

// Exporting model
export default models.Feedback || model<IFeedback>("Feedback", FeedbackSchema);
