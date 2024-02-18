"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const userSchema = new Schema({
    name: String,
    username: String,
    password: String,
    mobile: String,
    profileImage: { type: String, default: "stockProfileImage.jpg" },
    aboutMe: String,
    eventPricing: Number,
    blockStatus: { type: Boolean, default: false },
    artistFlag: { type: Boolean, default: false },
    images: {
        type: [],
        default: [],
    },
    tracks: [
        {
            name: String,
            albumArt: { type: String, default: "stockAlbumArt.png" },
            title: String,
        },
    ],
    videos: [
        {
            name: String,
            thumbnail: { type: String, default: "stockThumbnail.jpeg" },
            title: String,
        },
    ],
    eventBookings: [
        {
            userId: String,
            artistId: String,
            bookingDate: String,
            payment: Number,
            isConfirmed: Boolean,
        },
    ],
    favouriteTracks: [],
    favouriteArtists: [],
    favouriteVideos: [],
    bookedHistory: [],
}, { timestamps: true });
const userDetails = mongoose_1.default.model("User", userSchema);
exports.default = userDetails;
