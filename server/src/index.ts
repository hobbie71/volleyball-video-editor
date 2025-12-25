import express, { type Request, type Response } from "express";
import { createVideoRouter } from "./routes/videoRouter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 3000;

// CORS Middleware

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || [],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies/auth headers
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/", (req: Request, res: Response) => {
  res.send(`Server Successfully Running on PORT: ${PORT}`);
});

// ALL ROUTES BELOW THIS LINE

// Register video router
const videoRouter = createVideoRouter();
app.use("/api/videos", videoRouter);

// Global error handler
// ! MUST BE THE LAST MIDDLEWARE
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server Successfully Running on PORT: ${PORT}`);
});
