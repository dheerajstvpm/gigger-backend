import express from "express";
import cors from "cors";
import logger from "morgan";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import path from "path";
import mongoose from "mongoose";
import api from "./routes/api";

dotenv.config();

mongoose.set("strictQuery", true);

const app = express();

app.use(fileUpload());

mongoose
  .connect(String(process.env.dbURI))
  .then(() => {
    console.log("Connected to db");
  })
  .catch((error) => {
    console.log(error);
  });

app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

app.use(logger("dev"));
app.use(express.json());
app.use("/api", api);
app.get("/app", (req, res) => {
  res.send("From app.js");
});
app.get("/healthCheck", (req, res) => {
  res.send({ status: "OK" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on localhost : ${process.env.PORT}`);
});
