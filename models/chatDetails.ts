import mongoose from "mongoose";

const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    user1: String,
    user2: String,
    messages: [
      {
        sender: String,
        message: String,
        time: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

const chatDetails = mongoose.model("Chat", chatSchema);

export default chatDetails;
