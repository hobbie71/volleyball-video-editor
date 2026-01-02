import { AppError } from "../types/AppError.js";
import { fileService } from "./fileService.js";
import path from "path";

const { spawn } = await import("child_process");
const { promisify } = await import("util");
const { exec } = await import("child_process");
const execPromise = promisify(exec);

interface VideoMetadata {
  width: number;
  height: number;
  fps: number;
}

class FfmpegService {
  targetWidth: number = Number(process.env.FFMPEG_SCALE_WIDTH || 1280);
  targetFps: number = Number(process.env.FFMPEG_FRAME_RATE || 24);

  /**
   * Get video metadata using ffprobe
   */
  private async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    const command = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of json "${videoPath}"`;

    try {
      const { stdout } = await execPromise(command);
      const data = JSON.parse(stdout);
      const stream = data.streams[0];

      if (!stream) {
        throw new AppError("Could not read video stream metadata", 500);
      }

      // Parse frame rate (comes as fraction like "30/1" or "30000/1001")
      const [num, den] = stream.r_frame_rate.split("/").map(Number);
      const fps = Math.round(num / den);

      // Generate return metadata
      const metadata: VideoMetadata = {
        width: stream.width,
        height: stream.height,
        fps: fps,
      };

      return metadata;
    } catch (error) {
      throw new AppError(
        `Failed to get video metadata: ${error instanceof Error ? error.message : "Unknown error"}`,
        500
      );
    }
  }

  /**
   * Check if video needs compression based on resolution and fps
   */
  private needsCompression(metadata: VideoMetadata): boolean {
    return metadata.width > this.targetWidth || metadata.fps > this.targetFps;
  }

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

    // Check video metadata to see if compression is needed
    const metadata = await this.getVideoMetadata(inputPath);
    console.log(
      `Video metadata - Width: ${metadata.width}, Height: ${metadata.height}, FPS: ${metadata.fps}`
    );
    console.log(
      `Target settings - Width: ${this.targetWidth}, FPS: ${this.targetFps}`
    );

    // If video is already at or below target settings, just copy it
    if (!this.needsCompression(metadata)) {
      console.log("Video doesn't need compression, copying file...");
      await fileService.copyFile(inputPath, outputPath);
      return outputPath;
    }

    console.log("Compressing video...");
    const ffmpegArgs = [
      "-i",
      inputPath,
      "-vf",
      `scale=${this.targetWidth}:-1,fps=${this.targetFps}`,
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
