import mongoose, { Schema, Document, model, models } from "mongoose";
import "./user.model"; // Relative path import

// Interface for ticket response
export interface IResponse {
  message: string;
  respondedBy: mongoose.Types.ObjectId;
  respondedAt: Date;
}

// Interface for support ticket
export interface ISupportTicket extends Document {
  subject: string;
  description: string;
  status: "Pending" | "In_Progress" | "Resolved" | "Closed";
  priority: "Low" | "Normal" | "High" | "Urgent";
  userId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  response: IResponse[];
  customer?: any;
}

// Response Schema
const ResponseSchema: Schema<IResponse> = new Schema({
  message: { type: String, required: true },
  respondedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  respondedAt: { type: Date, default: Date.now },
});

// Main support ticket schema
const SupportTicketSchema: Schema<ISupportTicket> = new Schema(
  {
    subject: { type: String, required: true },
    description: { type: String, required: true },
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
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    response: [ResponseSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field configuration
SupportTicketSchema.virtual("customer", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

// Correct model name (ensure consistency)
export default models.SupportTicket || 
       model<ISupportTicket>("SupportTicket", SupportTicketSchema);