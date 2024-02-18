import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { validationResult } from "express-validator";
import fs from "fs";
import userController from "../controllers/userController";
import User from "../models/userDetails";

const currentUser: any = {};

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

const verifyToken = async (req: any, res: any, next: any) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      if (token !== "null") {
        const payload: any = jwt.verify(token, String(process.env.jwtKey));
        if (payload) {
          req.userId = payload.subject;
          currentUser.id = req.userId;
          next();
        }
      }
    } else {
      return res.status(401).send("Unauthorized token request");
    }
  } catch (err) {
    return res.status(500).send("Invalid token");
  }
};

const signupValidation = async (req: any, res: any, next: any) => {
  const signupErrors = validationResult(req);
  if (!signupErrors.isEmpty()) {
    return res.send(signupErrors);
  }
  try {
    console.log(req.body);
    const user = await User.findOne({
      username: req.body.username.toLowerCase(),
    });
    if (user) {
      return res.send({ signupError: "User already exist" });
    }
  } catch (err) {
    console.log(err);
  }
  next();
};

const OTPStatus = async (req: any, res: any) => {
  if (req.body.otp === "") {
    sendOTP(req, res);
  } else {
    verifyOTP(req, res);
  }
};

const sendOTP = async (req: any, res: any) => {
  const transporter = nodemailer.createTransport({
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
  const info = await transporter.sendMail({
    from: '"Gigger" gigger@gigger.com',
    to: req.body.username,
    subject: "OTP verification",
    text: `Hi ${req.body.name}, OTP for email verification is ${currentUser[email]}`,
    html: `<h3>Hi ${req.body.name},</h3><b>OTP for email verification is ${currentUser[email]}</b>`,
  });
  console.log("Message sent: %s", info.messageId);
  // next()
  userController.userSignupPost(req, res);
};

const verifyOTP = async (req: any, res: any) => {
  const email = req.body.username;
  if (req.body.otp !== currentUser[email]) {
    return res.send({ signupError: "Invalid OTP" });
  }
  userController.userSignupPost(req, res);
};

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

const deleteTrack = async (req: any, res: any, next: any) => {
  console.log(req.body);
  console.log(req.userId);
  const deleted = await User.updateOne(
    { _id: req.userId },
    { $pull: { tracks: { _id: req.body._id } } },
  );
  console.log(deleted);
  if (fs.existsSync(`./public/tracks/${req.body.name}`)) {
    fs.unlinkSync(`./public/tracks/${req.body.name}`);
    console.log("file deleted successfully");
  }
  if (fs.existsSync(`./public/albumArt/${req.body.albumArt}`)) {
    fs.unlinkSync(`./public/albumArt/${req.body.albumArt}`);
    console.log("albumArt deleted successfully");
  }
  next();
};

const deleteVideo = async (req: any, res: any, next: any) => {
  console.log(req.body);
  console.log(req.userId);
  await User.updateOne(
    { _id: req.userId },
    { $pull: { videos: { _id: req.body._id } } },
  );
  if (fs.existsSync(`./public/videos/${req.body.name}`)) {
    fs.unlinkSync(`./public/videos/${req.body.name}`);
    console.log("file deleted successfully");
  }
  if (fs.existsSync(`./public/thumbnail/${req.body.albumArt}`)) {
    fs.unlinkSync(`./public/thumbnail/${req.body.albumArt}`);
    console.log("albumArt deleted successfully");
  }
  next();
};

const imageUpload = async (req: any, res: any, next: any) => {
  const str = req.files.file0.name;
  const n = str.lastIndexOf(".");
  const fileExt = str.substring(n);
  const uniqueFileId = req.userId + fileExt;
  const folderName = "./public/images/";
  try {
    await User.updateOne(
      { _id: req.userId },
      { $set: { profileImage: uniqueFileId } },
    );
    req.files.file0.mv(folderName + uniqueFileId);
    console.log(`Image uploaded : ${str}`);
  } catch (err) {
    console.log(err);
  }
  next();
};

const trackUpload = async (req: any, res: any, next: any) => {
  const folderName = "./public/tracks/";
  for (const item of Object.values(req.files)) {
    try {
      const file = item as unknown as any;
      const fileName = `${req.userId}_${file.name}`;
      await User.updateOne(
        { _id: req.userId },
        { $push: { tracks: { name: fileName } } },
      );
      await file.mv(folderName + fileName);
      console.log(`Track uploaded : ${fileName}`);
    } catch (err) {
      console.log(err);
    }
  }
  next();
};

const albumArtUpload = async (req: any, res: any, next: any) => {
  const albumArt = req.files.albumArt.name;
  console.log(albumArt);
  const str = req.files.file0.name;
  const n = str.lastIndexOf(".");
  const fileExt = str.substring(n);
  const trackName = req.files.albumArt.name;
  const uniqueFileId = trackName + fileExt;
  const folderName = "./public/albumArt/";
  try {
    await User.updateOne(
      { _id: req.userId, "tracks.name": trackName },
      { $set: { "tracks.$.albumArt": uniqueFileId } },
    );
    req.files.file0.mv(folderName + uniqueFileId);
    console.log(`Image uploaded : ${str}`);
  } catch (err) {
    console.log(err);
  }
  next();
};

const videoUpload = async (req: any, res: any, next: any) => {
  const folderName = "./public/videos/";
  for (const item of Object.values(req.files)) {
    try {
      const file = item as unknown as any;
      const fileName = `${req.userId}_${file.name}`;
      await User.updateOne(
        { _id: req.userId },
        { $push: { videos: { name: fileName } } },
      );
      await file.mv(folderName + fileName);
      console.log(`Video uploaded : ${fileName}`);
    } catch (err) {
      console.log(err);
    }
  }
  next();
};

const thumbnailUpload = async (req: any, res: any, next: any) => {
  const albumArt = req.files.albumArt.name;
  console.log(albumArt);
  const str = req.files.file0.name;
  const n = str.lastIndexOf(".");
  const fileExt = str.substring(n);
  const trackName = req.files.albumArt.name;
  const uniqueFileId = trackName + fileExt;
  const folderName = "./public/thumbnail/";
  try {
    await User.updateOne(
      { _id: req.userId, "videos.name": trackName },
      { $set: { "videos.$.thumbnail": uniqueFileId } },
    );
    req.files.file0.mv(folderName + uniqueFileId);
    console.log(`Image uploaded : ${str}`);
  } catch (err) {
    console.log(err);
  }
  next();
};

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

export default middlewares;
