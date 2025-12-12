// models/agent.model.ts

import mongoose, { Schema, Document } from "mongoose";

// Define the Agent interface
export interface IAgent extends Document {
  name: string;
  email: string;
  phone: string;
  role: string; // e.g., Support Agent, Technical Expert
  department: string; // e.g., IT, Billing, Customer Support
  isAvailable: boolean;
  status: "active" | "inactive" | "on_leave";
  expertise: string[]; // e.g., ['Networking', 'Hardware']
  assignedTickets: mongoose.Types.ObjectId[]; // refs to tickets/issues
  location?: string;
  profileImage?: string;
}

// Create the Agent schema
const agentSchema = new Schema<IAgent>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    role: { type: String, required: true },
    department: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["active", "inactive", "on_leave"],
      default: "active",
    },
    expertise: [{ type: String }],
    assignedTickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }],
    location: { type: String },
    profileImage: { type: String }, // path or URL
  },
  { timestamps: true }
);

// Create and export the model
const Agent =
  mongoose.models.Agent || mongoose.model<IAgent>("Agent", agentSchema);
export default Agent;
