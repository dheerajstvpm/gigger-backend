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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userDetails_1 = __importDefault(require("../models/userDetails"));
const adminDetails_1 = __importDefault(require("../models/adminDetails"));
const userSignupPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.otp === "") {
        res.send({ token: "OTP sent" });
    }
    else {
        bcryptjs_1.default
            .hash(req.body.password, 10)
            .then((hash) => {
            const user = new userDetails_1.default({
                artistFlag: req.body.artistFlag,
                name: req.body.name,
                username: req.body.username.toLowerCase(),
                password: hash,
            });
            user
                .save()
                .then((result) => {
                console.log(result);
                const payload = { subject: result._id };
                const token = jsonwebtoken_1.default.sign(payload, String(process.env.jwtKey));
                res.send({ token });
            })
                .catch((err) => {
                console.log(err);
            });
        })
            .catch((err) => {
            console.log(err);
        });
    }
});
const userLoginPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userDetails_1.default.findOne({ username: req.body.username });
        if (!user) {
            res.send({ loginError: "Invalid username" });
        }
        else if (user.blockStatus) {
            res.send({ loginError: "User blocked" });
        }
        else {
            bcryptjs_1.default
                .compare(req.body.password, user.password)
                .then((bcryptResult) => {
                if (bcryptResult) {
                    const payload = { subject: user._id };
                    const token = jsonwebtoken_1.default.sign(payload, String(process.env.jwtKey));
                    res.send({ token });
                }
                else {
                    res.send({ loginError: "Invalid password" });
                }
            })
                .catch((err) => {
                console.log(err);
            });
        }
    }
    catch (err) {
        console.log(err);
    }
});
const adminLoginPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = yield adminDetails_1.default.findOne({ username: req.body.username });
        if (!admin) {
            res.send({ loginError: "Invalid username" });
        }
        else if (admin.blockStatus) {
            res.send({ loginError: "User blocked" });
        }
        else {
            bcryptjs_1.default
                .compare(req.body.password, admin.password)
                .then((bcryptResult) => {
                if (bcryptResult) {
                    const payload = { subject: admin._id };
                    const token = jsonwebtoken_1.default.sign(payload, String(process.env.jwtKey));
                    res.send({ token });
                }
                else {
                    res.send({ loginError: "Invalid password" });
                }
            })
                .catch((err) => {
                console.log(err);
            });
        }
    }
    catch (err) {
        console.log(err);
    }
});
const usersGet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userDetails_1.default.find({}).select("-password");
        res.json(users);
    }
    catch (err) {
        console.log(err);
    }
});
const profileGet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userDetails_1.default.findOne({ _id: req.userId }).select("-password");
        // console.log(user._id);
        res.send(user);
    }
    catch (err) {
        console.log(err);
    }
});
const profilePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        console.log(req.userId);
        yield userDetails_1.default.findOneAndUpdate({ _id: req.body._id }, {
            $set: {
                blockStatus: req.body.blockStatus,
                name: req.body.name,
                aboutMe: req.body.aboutMe,
                favouriteTracks: req.body.favouriteTracks,
                favouriteArtists: req.body.favouriteArtists,
                eventBookings: req.body.eventBookings,
            },
        });
        const user = yield userDetails_1.default.findOne({ _id: req.body._id }).select("-password");
        res.send(user);
    }
    catch (err) {
        console.log(err);
    }
});
const userController = {
    userSignupPost,
    userLoginPost,
    usersGet,
    profileGet,
    profilePost,
    adminLoginPost,
};
exports.default = userController;
