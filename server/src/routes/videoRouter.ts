import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { upload, cleanupTempFile } from "../middleware/upload.js";
import type {
  PostCompressVideoResponse,
  PostConcatVideoResponse,
} from "@vve/shared/schemas/videoApi.schema.js";
import { AppError } from "../types/AppError.js";
import { ffmpegService } from "../services/ffmpegService.js";
import { fileService } from "../services/fileService.js";

export const createVideoRouter = () => {
  const router = Router();

  router.post(
    "/compress/:gameId/:videoIndex",
    upload.single("video"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const file = req.file;
        const gameId = req.params.gameId;
        const videoIndexParam = req.params.videoIndex;

        // Validate gameId
        if (!gameId) {
          return next(new AppError("Game ID is required", 400));
        }

        // Validate videoIndex
        if (!videoIndexParam) {
          return next(new AppError("Video index is required", 400));
        }

        const videoIndex = parseInt(videoIndexParam, 10);
        if (isNaN(videoIndex) || videoIndex < 0 || videoIndex > 10) {
          return next(new AppError("Video index must be a number between 0 and 10", 400));
        }

        // Ensure file was uploaded
        if (!file) {
          return next(new AppError("No video file provided", 400));
        }

        console.log(`Processing video: ${file.originalname}`);
        console.log(`Temp path: ${file.path}`);
        console.log(`Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

        const compressedVideoPath = await ffmpegService.compressVideo(
          file.path,
          gameId,
          videoIndex
        );

        // Clean up the uploaded temp file
        await cleanupTempFile(file.path);

        // Generate response
        const response: PostCompressVideoResponse = {
          message: "Video compressed successfully",
          compressedVideoUrl: compressedVideoPath,
        };

        res.status(200).json(response);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    "/concat/:gameId",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const gameId = req.params.gameId;

        // Validate gameId
        if (!gameId) {
          return next(new AppError("Game ID is required", 400));
        }

        const videos: string[] = req.body.videos;

        // Ensure videos array is provided
        if (!videos || !Array.isArray(videos) || videos.length === 0) {
          return next(
            new AppError("No videos provided for concatenation", 400)
          );
        }

        // Security: Validate all video paths are within the output directory
        for (const videoPath of videos) {
          if (!fileService.isPathWithinGameDir(videoPath, gameId)) {
            return next(
              new AppError(
                "Invalid video path: paths must be within the game output directory",
                400
              )
            );
          }
          // Also verify files exist
          if (!fileService.fileExists(videoPath)) {
            return next(
              new AppError(`Video file not found: ${videoPath.split('/').pop()}`, 404)
            );
          }
        }

        const concatenatedVideoPath = await ffmpegService.concatenateVideos(
          videos,
          gameId
        );

        // Clean up compressed video files after successful concatenation
        await fileService.cleanupFiles(videos);
        console.log(`Cleaned up ${videos.length} compressed video files`);

        // Generate response
        const response: PostConcatVideoResponse = {
          message: "Videos concatenated successfully",
          concatenatedVideoUrl: concatenatedVideoPath,
        };

        res.status(200).json(response);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
};
