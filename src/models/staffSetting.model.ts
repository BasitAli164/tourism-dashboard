// models/Staff.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export type StaffRole = 
  | 'Admin'
  | 'Support'
  | 'Manager'
  | 'TourGuide'
  | 'Agent'
  | 'ContentCreator'
  | 'Traveler';

export interface IStaff extends Document {
  name: string;
  email: string;
  role: StaffRole;
  phone?: string;
  address?: string;
  department?: string;
  joiningDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    required: true,
    enum: ['Admin', 'Support', 'Manager', 'TourGuide', 'Agent', 'ContentCreator', 'Traveler']
  },
  phone: { type: String },
  address: { type: String },
  department: { type: String },
  joiningDate: { type: Date },
  notes: { type: String }
}, {
  timestamps: true
});

// Create text index for search functionality
StaffSchema.index({ name: 'text', email: 'text', department: 'text' });

export const StaffModel = mongoose.models.Staff || mongoose.model<IStaff>('Staff', StaffSchema);