import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["user", "agent", "admin"], default: "user" }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);