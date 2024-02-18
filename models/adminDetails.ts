import mongoose from "mongoose";

const { Schema } = mongoose;

const adminSchema = new Schema(
  {
    username: String,
    password: String,
  },
  { timestamps: true },
);

const adminDetails = mongoose.model("Admin", adminSchema);

export default adminDetails;
