"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const userController_1 = __importDefault(require("../controllers/userController"));
const middlewares_1 = __importDefault(require("../middlewares/middlewares"));
const router = express_1.default.Router();
router.get("/", (req, res) => {
    res.send("From API route");
});
router.post("/signup", (0, express_validator_1.check)("name").notEmpty().withMessage("Please enter a Name"), (0, express_validator_1.check)("username").notEmpty().withMessage("Please enter a username"), (0, express_validator_1.check)("username")
    .matches(/^\w+([\._]?\w+)?@\w+(\.\w{2,3})(\.\w{2})?$/)
    .withMessage("Username must be a valid email id"), (0, express_validator_1.check)("password")
    .matches(/[\w\d!@#$%^&*?]{8,}/)
    .withMessage("Password must contain at least eight characters"), (0, express_validator_1.check)("password")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter"), (0, express_validator_1.check)("password")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter"), (0, express_validator_1.check)("password")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"), (0, express_validator_1.check)("password")
    .matches(/[!@#$%^&*?]/)
    .withMessage("Password must contain at least one special character"), (0, express_validator_1.check)("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
        throw new Error("Passwords do not match");
    }
    return true;
}), middlewares_1.default.signupValidation, middlewares_1.default.OTPStatus);
router.post("/login", userController_1.default.userLoginPost);
router.post("/adminLogin", userController_1.default.adminLoginPost);
router.get("/users", userController_1.default.usersGet);
// router.get('/token', middlewares.validToken);
router.get("/profile", middlewares_1.default.verifyToken, userController_1.default.profileGet);
router.post("/profile", middlewares_1.default.verifyToken, userController_1.default.profilePost);
router.post("/imageUpload", middlewares_1.default.verifyToken, middlewares_1.default.imageUpload, userController_1.default.profileGet);
router.post("/trackUpload", middlewares_1.default.verifyToken, middlewares_1.default.trackUpload, userController_1.default.profileGet);
router.post("/albumArtUpload", middlewares_1.default.verifyToken, middlewares_1.default.albumArtUpload, userController_1.default.profileGet);
router.post("/videoUpload", middlewares_1.default.verifyToken, middlewares_1.default.videoUpload, userController_1.default.profileGet);
router.post("/thumbnailUpload", middlewares_1.default.verifyToken, middlewares_1.default.thumbnailUpload, userController_1.default.profileGet);
router.post("/trackDelete", middlewares_1.default.verifyToken, middlewares_1.default.deleteTrack, userController_1.default.profileGet);
router.post("/videoDelete", middlewares_1.default.verifyToken, middlewares_1.default.deleteVideo, userController_1.default.profileGet);
exports.default = router;
