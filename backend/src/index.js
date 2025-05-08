import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import route from "./routes/index.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
const PORT = process.env.PORT;

app.use("/api", route);
app.listen(PORT, () => {
  console.log("Server is opening on " + PORT);
  connectDB();
});
