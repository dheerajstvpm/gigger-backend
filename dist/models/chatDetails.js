"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const chatSchema = new Schema({
    user1: String,
    user2: String,
    messages: [
        {
            sender: String,
            message: String,
            time: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });
const chatDetails = mongoose_1.default.model("Chat", chatSchema);
exports.default = chatDetails;
