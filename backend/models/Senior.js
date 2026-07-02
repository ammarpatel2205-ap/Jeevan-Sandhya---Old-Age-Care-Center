import mongoose from "mongoose";

const seniorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    age: { type: Number },
    gender: String,
    address: String,
    phone: { type: String, required: true }
  },
  { timestamps: true }
);

const Senior = mongoose.model("Senior", seniorSchema);
export default Senior;
