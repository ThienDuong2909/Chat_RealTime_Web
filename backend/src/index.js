import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import route from "./routes/index.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket.js";

dotenv.config();

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
const PORT = process.env.PORT;

app.use("/api", route);
server.listen(PORT, () => {
  console.log("Server is opening on " + PORT);
  connectDB();
});
