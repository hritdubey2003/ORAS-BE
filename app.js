import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./route/authRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "User Service is healthy"
  });
});

app.use("/api/users", authRoutes);

app.use(errorHandler);

export default app;