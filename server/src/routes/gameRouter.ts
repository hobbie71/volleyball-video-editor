import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import {
  type GetGameEventsResponse,
  type GetNewGameIdResponse,
} from "@vve/shared/schemas/gameApi.schema.js";
import { AppError } from "../types/AppError.js";
import { geminiService } from "../services/geminiService.js";
import { fileService } from "../services/fileService.js";
import type { GameEvent } from "@vve/shared/types/gameEvent.types.js";

export const createGameRouter = () => {
  const router = Router();

  router.get(
    "/newGameId",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Create random UUID for new game ID
        const newGameId = crypto.randomUUID();

        // Create response
        const response: GetNewGameIdResponse = {
          gameId: newGameId,
        };

        res.status(200).json(response);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/events",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const gameId = req.query.gameId as string;
        const videoPath = req.query.videoPath as string;

        // Validate gameId
        if (!gameId) {
          return next(new AppError("Game ID is required", 400));
        }

        // Validate videoPath
        if (!videoPath) {
          return next(new AppError("Video path is required", 400));
        }

        // Security: Validate video path is within the game's output directory
        if (!fileService.isPathWithinGameDir(videoPath, gameId)) {
          return next(
            new AppError(
              "Invalid video path: path must be within the game output directory",
              400
            )
          );
        }

        // Verify file exists
        if (!fileService.fileExists(videoPath)) {
          return next(new AppError("Video file not found", 404));
        }

        // Get Events from Gemini
        const events: GameEvent[] =
          await geminiService.getVolleyballVideoEvents(videoPath);

        // Clean up final video file after successful AI processing
        await fileService.cleanupFile(videoPath);
        console.log(`Cleaned up final video file: ${videoPath}`);

        // Create response
        const response: GetGameEventsResponse = {
          message: "Game events retrieved successfully",
          events: events,
        };

        res.status(200).json(response);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
};
