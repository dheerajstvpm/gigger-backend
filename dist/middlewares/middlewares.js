"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const express_validator_1 = require("express-validator");
const fs_1 = __importDefault(require("fs"));
const userController_1 = __importDefault(require("../controllers/userController"));
const userDetails_1 = __importDefault(require("../models/userDetails"));
const currentUser = {};
// const validToken = async (req, res, next) => {
//     try {
//         if (req.headers.authorization) {
//             let token = req.headers.authorization.split(" ")[1]
//             if (token !== 'null') {
//                 let payload = jwt.verify(token, process.env.jwtKey)
//                 if (payload) {
//                     return true
//                 }
//             }
//         } else {
//             return false
//         }
//     } catch (err) {
//         return false
//     }
// }
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(" ")[1];
            if (token !== "null") {
                const payload = jsonwebtoken_1.default.verify(token, String(process.env.jwtKey));
                if (payload) {
                    req.userId = payload.subject;
                    currentUser.id = req.userId;
                    next();
                }
            }
        }
        else {
            return res.status(401).send("Unauthorized token request");
        }
    }
    catch (err) {
        return res.status(500).send("Invalid token");
    }
});
const signupValidation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const signupErrors = (0, express_validator_1.validationResult)(req);
    if (!signupErrors.isEmpty()) {
        return res.send(signupErrors);
    }
    try {
        console.log(req.body);
        const user = yield userDetails_1.default.findOne({
            username: req.body.username.toLowerCase(),
        });
        if (user) {
            return res.send({ signupError: "User already exist" });
        }
    }
    catch (err) {
        console.log(err);
    }
    next();
});
const OTPStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.otp === "") {
        sendOTP(req, res);
    }
    else {
        verifyOTP(req, res);
    }
});
const sendOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.usernameSMTP,
            pass: process.env.passwordSMTP,
        },
    });
    const email = req.body.username;
    currentUser[email] = `${Math.floor(Math.random() * 1000)}`.padStart(4, "0");
    const info = yield transporter.sendMail({
        from: '"Gigger" gigger@gigger.com',
        to: req.body.username,
        subject: "OTP verification",
        text: `Hi ${req.body.name}, OTP for email verification is ${currentUser[email]}`,
        html: `<h3>Hi ${req.body.name},</h3><b>OTP for email verification is ${currentUser[email]}</b>`,
    });
    console.log("Message sent: %s", info.messageId);
    // next()
    userController_1.default.userSignupPost(req, res);
});
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.username;
    if (req.body.otp !== currentUser[email]) {
        return res.send({ signupError: "Invalid OTP" });
    }
    userController_1.default.userSignupPost(req, res);
});
// const onFileupload = async (req, res) => {
//     console.log(req.path);
//     console.log(req.files);
//     console.log(currentUser.id);
//     if (req.path === "/imageUpload") {
//     }
//     if (req.path === "/trackUpload") {
//     }
//     if (req.path === "/albumArtUpload") {
//         const albumArt = req.files.albumArt.name;
//         console.log(albumArt);
//         const str = req.files.file0.name;
//         const n = str.lastIndexOf('.');
//         const fileExt = str.substring(n);
//         const trackName = req.files.albumArt.name;
//         const uniqueFileId = trackName + fileExt;
//         fileName = './public/albumArt/';
//         try {
//             await User.updateOne({ _id: currentUser.id, "tracks.name": trackName }, { $set: { "tracks.$.albumArt": uniqueFileId } })
//             req.files.file0.mv(fileName + uniqueFileId);
//             console.log('Image uploaded : ' + str);
//         } catch (err) {
//             console.log(err)
//         }
//     }
//     if (req.path === "/videoUpload") {
//         folderName = './public/videos/'
//         for (file of Object.values(req.files)) {
//             try {
//                 fileName = currentUser.id + '_' + file.name
//                 await User.updateOne({ _id: currentUser.id }, { $push: { videos: { name: fileName } } })
//                 await file.mv(folderName + fileName);
//                 console.log('Video uploaded : ' + fileName);
//             } catch (err) {
//                 console.log(err)
//             }
//         }
//     }
// }
const deleteTrack = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    console.log(req.userId);
    const deleted = yield userDetails_1.default.updateOne({ _id: req.userId }, { $pull: { tracks: { _id: req.body._id } } });
    console.log(deleted);
    if (fs_1.default.existsSync(`./public/tracks/${req.body.name}`)) {
        fs_1.default.unlinkSync(`./public/tracks/${req.body.name}`);
        console.log("file deleted successfully");
    }
    if (fs_1.default.existsSync(`./public/albumArt/${req.body.albumArt}`)) {
        fs_1.default.unlinkSync(`./public/albumArt/${req.body.albumArt}`);
        console.log("albumArt deleted successfully");
    }
    next();
});
const deleteVideo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    console.log(req.userId);
    yield userDetails_1.default.updateOne({ _id: req.userId }, { $pull: { videos: { _id: req.body._id } } });
    if (fs_1.default.existsSync(`./public/videos/${req.body.name}`)) {
        fs_1.default.unlinkSync(`./public/videos/${req.body.name}`);
        console.log("file deleted successfully");
    }
    if (fs_1.default.existsSync(`./public/thumbnail/${req.body.albumArt}`)) {
        fs_1.default.unlinkSync(`./public/thumbnail/${req.body.albumArt}`);
        console.log("albumArt deleted successfully");
    }
    next();
});
const imageUpload = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const str = req.files.file0.name;
    const n = str.lastIndexOf(".");
    const fileExt = str.substring(n);
    const uniqueFileId = req.userId + fileExt;
    const folderName = "./public/images/";
    try {
        yield userDetails_1.default.updateOne({ _id: req.userId }, { $set: { profileImage: uniqueFileId } });
        req.files.file0.mv(folderName + uniqueFileId);
        console.log(`Image uploaded : ${str}`);
    }
    catch (err) {
        console.log(err);
    }
    next();
});
const trackUpload = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const folderName = "./public/tracks/";
    for (const item of Object.values(req.files)) {
        try {
            const file = item;
            const fileName = `${req.userId}_${file.name}`;
            yield userDetails_1.default.updateOne({ _id: req.userId }, { $push: { tracks: { name: fileName } } });
            yield file.mv(folderName + fileName);
            console.log(`Track uploaded : ${fileName}`);
        }
        catch (err) {
            console.log(err);
        }
    }
    next();
});
const albumArtUpload = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const albumArt = req.files.albumArt.name;
    console.log(albumArt);
    const str = req.files.file0.name;
    const n = str.lastIndexOf(".");
    const fileExt = str.substring(n);
    const trackName = req.files.albumArt.name;
    const uniqueFileId = trackName + fileExt;
    const folderName = "./public/albumArt/";
    try {
        yield userDetails_1.default.updateOne({ _id: req.userId, "tracks.name": trackName }, { $set: { "tracks.$.albumArt": uniqueFileId } });
        req.files.file0.mv(folderName + uniqueFileId);
        console.log(`Image uploaded : ${str}`);
    }
    catch (err) {
        console.log(err);
    }
    next();
});
const videoUpload = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const folderName = "./public/videos/";
    for (const item of Object.values(req.files)) {
        try {
            const file = item;
            const fileName = `${req.userId}_${file.name}`;
            yield userDetails_1.default.updateOne({ _id: req.userId }, { $push: { videos: { name: fileName } } });
            yield file.mv(folderName + fileName);
            console.log(`Video uploaded : ${fileName}`);
        }
        catch (err) {
            console.log(err);
        }
    }
    next();
});
const thumbnailUpload = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const albumArt = req.files.albumArt.name;
    console.log(albumArt);
    const str = req.files.file0.name;
    const n = str.lastIndexOf(".");
    const fileExt = str.substring(n);
    const trackName = req.files.albumArt.name;
    const uniqueFileId = trackName + fileExt;
    const folderName = "./public/thumbnail/";
    try {
        yield userDetails_1.default.updateOne({ _id: req.userId, "videos.name": trackName }, { $set: { "videos.$.thumbnail": uniqueFileId } });
        req.files.file0.mv(folderName + uniqueFileId);
        console.log(`Image uploaded : ${str}`);
    }
    catch (err) {
        console.log(err);
    }
    next();
});
const middlewares = {
    OTPStatus,
    sendOTP,
    signupValidation,
    verifyOTP,
    // validToken,
    verifyToken,
    imageUpload,
    trackUpload,
    albumArtUpload,
    videoUpload,
    deleteTrack,
    deleteVideo,
    thumbnailUpload,
};
exports.default = middlewares;
