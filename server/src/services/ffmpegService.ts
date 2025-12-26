class FfmpegService {
  public async compressVideo(
    inputPath: string,
    gameId: string,
    videoIndex: number
  ): Promise<string> {
    // TODO: Implement video compression logic using ffmpeg
    // Output should go to: OUTPUT_DIR/{gameId}/compressed/{videoIndex}.mp4
  }

  public async concatenateVideos(
    videoPaths: string[],
    gameId: string
  ): Promise<string> {
    // TODO: Implement video concatenation logic using ffmpeg
  }
}

export const ffmpegService = new FfmpegService();
