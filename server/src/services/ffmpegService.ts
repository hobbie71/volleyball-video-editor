import { AppError } from "../types/AppError.js";
import { fileService } from "./fileService.js";
import path from "path";

const { spawn } = await import("child_process");

class FfmpegService {
  scale: string = `${process.env.FFMPEG_SCALE_WIDTH || "1280"}:${process.env.FFMPEG_SCALE_HEIGHT || "-1"}`; // Maintain aspect ratio with width 1280
  fps: number = Number(process.env.FFMPEG_FRAME_RATE || 24); // Target frame rate

  public async compressVideo(
    inputPath: string,
    gameId: string,
    videoIndex: number
  ): Promise<string> {
    // Output should go to: OUTPUT_DIR/{gameId}/compressed/{videoIndex}.mp4
    const outputDir = path.join(
      fileService.getGameOutputDir(gameId),
      "compressed"
    );
    const outputPath = path.join(outputDir, `${videoIndex}.mp4`);

    // Ensure the output directory exists
    await fileService.ensureDirectory(outputDir);

    const ffmpegArgs = [
      "-i",
      inputPath,
      "-vf",
      `scale=${this.scale},fps=${this.fps}`,
      "-c:v",
      "libx264",
      "-crf",
      "23",
      "-c:a",
      "copy", // Copy audio to save CPU
      "-y", // Overwrite output if it exists
      outputPath,
    ];

    const ffmpegProcess = spawn("ffmpeg", ffmpegArgs);

    ffmpegProcess.stderr.on("data", (data) => {
      console.log(`ffmpeg stderr: ${data}`);
    });

    return new Promise<string>((resolve, reject) => {
      ffmpegProcess.on("close", (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new AppError(`ffmpeg process exited with code ${code}`, 500));
        }
      });
    });
  }

  public async concatenateVideos(
    videoPaths: string[],
    gameId: string
  ): Promise<string> {
    // TODO: Implement video concatenation logic using ffmpeg
  }
}

export const ffmpegService = new FfmpegService();
