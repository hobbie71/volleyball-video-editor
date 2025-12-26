import { z } from "zod";
import {
  GoogleAIFileManager,
  type FileMetadataResponse,
} from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  GameEventArraySchema,
  type GameEvent,
} from "@vve/shared/types/gameEvent.types.js";
import { zodToJsonSchema } from "zod-to-json-schema";

class GeminiService {
  private apiKey: string;
  private aiClient: GoogleGenerativeAI;
  private fileManager: GoogleAIFileManager;

  constructor() {
    this.apiKey = z.string().nonempty().parse(process.env.GEMINI_API_KEY);
    this.fileManager = new GoogleAIFileManager(this.apiKey);
    this.aiClient = new GoogleGenerativeAI(this.apiKey);
  }

  private async uploadVideo(filePath: string): Promise<FileMetadataResponse> {
    const response = await this.fileManager.uploadFile(filePath, {
      mimeType: "video/mp4",
      displayName: "volleyball_video.mp4",
    });

    return response.file;
  }

  public async getVolleyballVideoEvents(
    filePath: string
  ): Promise<GameEvent[]> {
    // TODO: Finish implementation

    // as any required due to zod-to-json-schema types V4 and V3 mismatch
    const schema = zodToJsonSchema(GameEventArraySchema as any);

    const uploadResult = await this.uploadVideo(filePath);

    const model = this.aiClient.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        // as any required due to zod-to-json-schema types V4 and V3 mismatch
        responseSchema: schema as any,
      },
    });

    const prompt = `Analyze the volleyball game video and extract all game events including rally starts, rally ends, and serves.`;

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResult.mimeType,
          fileUri: uploadResult.uri,
        },
      },
      prompt,
    ]);

    return JSON.parse(result.response.text());
  }
}

export const geminiService = new GeminiService();
