"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const api_1 = __importDefault(require("./routes/api"));
dotenv_1.default.config();
mongoose_1.default.set("strictQuery", true);
const app = (0, express_1.default)();
app.use((0, express_fileupload_1.default)());
mongoose_1.default
    .connect(String(process.env.dbURI))
    .then(() => {
    console.log("Connected to db");
})
    .catch((error) => {
    console.log(error);
});
app.use((0, cors_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use("/api", api_1.default);
app.get("/app", (req, res) => {
    res.send("From app.js");
});
app.get("/healthCheck", (req, res) => {
    res.send({ status: "OK" });
});
app.listen(process.env.PORT, () => {
    console.log(`Server running on localhost : ${process.env.PORT}`);
});
