"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const adminSchema = new Schema({
    username: String,
    password: String,
}, { timestamps: true });
const adminDetails = mongoose_1.default.model("Admin", adminSchema);
exports.default = adminDetails;
