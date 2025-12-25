import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { upload, cleanupTempFile } from "../middleware/upload.js";
import type { ErrorResponse } from "@shared/types/errorResponse.types.js";
import type { PostVideoEventsResponse } from "@shared/schemas/videoApi.schema.js";
import { AppError } from "../types/AppError.js";
import type { GameEvent } from "@shared/types/gameEvent.types.js";

export const createVideoRouter = () => {
  const router = Router();

  /**
   * POST /api/videos/process
   *
   * Upload a video file, process it with AI, and return extracted events.
   * The video is stored temporarily and deleted after processing.
   */
  router.post(
    "/events",
    upload.single("video"),
    async (
      req: Request,
      res: Response<PostVideoEventsResponse | ErrorResponse>,
      next: NextFunction
    ) => {
      const file = req.file;

      try {
        // Ensure file was uploaded
        if (!file) {
          return next(new AppError("No video file provided", 400));
        }

        console.log(`Processing video: ${file.originalname}`);
        console.log(`Temp path: ${file.path}`);
        console.log(`Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

        // TODO: Send to Gemini for processing
        // const events = await processWithGemini(file.path);

        // Placeholder: mock events for now
        const mockEvents: GameEvent[] = [
          { type: "serve", timestamp: 12.5, confidence: 0.95 },
          { type: "rally_end", timestamp: 18.4, confidence: 0.97 },
        ];

        // Create response
        const response: PostVideoEventsResponse = {
          message: "Video processed successfully",
          events: mockEvents,
        };

        res.status(200).json(response);
      } catch (error) {
        // Pass error to global error handler
        next(error);
      } finally {
        // Always clean up the temp file
        if (file?.path) {
          await cleanupTempFile(file.path);
        }
      }
    }
  );

  return router;
};
