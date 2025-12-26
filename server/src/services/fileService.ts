import path from "path";
import fs from "fs";

// Output directory for processed videos
const OUTPUT_DIR = process.env.OUTPUT_DIR || "/tmp/volleyball-output";

class FileService {
  /**
   * Get the output directory path
   */
  public getOutputDir(): string {
    return OUTPUT_DIR;
  }

  /**
   * Get the game-specific output directory path
   */
  public getGameOutputDir(gameId: string): string {
    return path.join(OUTPUT_DIR, gameId);
  }

  /**
   * Validate that a file path is within the expected directory.
   * Prevents path traversal attacks.
   */
  public isPathWithinDirectory(filePath: string, directory: string): boolean {
    const resolvedPath = path.resolve(filePath);
    const resolvedDir = path.resolve(directory);
    return resolvedPath.startsWith(resolvedDir + path.sep);
  }

  /**
   * Validate that a file path is within a game's output directory
   */
  public isPathWithinGameDir(filePath: string, gameId: string): boolean {
    const gameDir = this.getGameOutputDir(gameId);
    return this.isPathWithinDirectory(filePath, gameDir);
  }

  /**
   * Check if a file exists
   */
  public fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * Clean up (delete) a single file
   */
  public async cleanupFile(filePath: string): Promise<void> {
    try {
      await fs.promises.unlink(filePath);
      console.log(`Cleaned up file: ${filePath}`);
    } catch (error) {
      console.warn(`Failed to cleanup file: ${filePath}`, error);
    }
  }

  /**
   * Clean up (delete) multiple files
   */
  public async cleanupFiles(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      await this.cleanupFile(filePath);
    }
  }

  /**
   * Clean up an entire directory and its contents
   */
  public async cleanupDirectory(dirPath: string): Promise<void> {
    try {
      await fs.promises.rm(dirPath, { recursive: true, force: true });
      console.log(`Cleaned up directory: ${dirPath}`);
    } catch (error) {
      console.warn(`Failed to cleanup directory: ${dirPath}`, error);
    }
  }

  /**
   * Ensure a directory exists, creating it if necessary
   */
  public async ensureDirectory(dirPath: string): Promise<void> {
    await fs.promises.mkdir(dirPath, { recursive: true });
  }
}

export const fileService = new FileService();
