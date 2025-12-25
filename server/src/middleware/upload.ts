import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";

// Create a temp directory for uploads
const TEMP_DIR = path.join(os.tmpdir(), "volleyball-video-editor");

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Allowed video MIME types
const ALLOWED_MIME_TYPES = [
  "video/mp4",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
  "video/webm",
  "video/x-matroska", // .mkv
];

// Max file size: 10GB (adjust based on your needs)
const MAX_FILE_SIZE = 1024 * 1024 * 1024 * 10;

/**
 * Multer storage configuration.
 * Files are stored in the OS temp directory and will be cleaned up after processing.
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, TEMP_DIR);
  },
  filename: (_req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

/**
 * File filter to only accept video files.
 */
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`
      )
    );
  }
};

/**
 * Configured multer instance for video uploads.
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Helper to clean up a temp file after processing.
 */
export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.promises.unlink(filePath);
    console.log(`Cleaned up temp file: ${filePath}`);
  } catch (error) {
    // File might already be deleted, that's okay
    console.warn(`Failed to cleanup temp file: ${filePath}`, error);
  }
}

/**
 * Get the temp directory path (useful for debugging).
 */
export function getTempDir(): string {
  return TEMP_DIR;
}
