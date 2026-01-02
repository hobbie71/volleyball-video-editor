import { z } from "zod";
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
  type File,
} from "@google/genai";
import {
  GameEventArraySchema,
  type GameEvent,
} from "@vve/shared/types/gameEvent.types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { AppError } from "../types/AppError.js";

class GeminiService {
  private apiKey: string;
  private aiClient: GoogleGenAI;

  constructor() {
    this.apiKey = z.string().nonempty().parse(process.env.GEMINI_API_KEY);
    // this.fileManager = new GoogleAIFileManager(this.apiKey);
    this.aiClient = new GoogleGenAI({ apiKey: this.apiKey });
  }

  private async uploadVideo(filePath: string): Promise<File> {
    let file: File = await this.aiClient.files.upload({
      file: filePath,
      config: {
        mimeType: "video/mp4",
        displayName: "volleyball_video.mp4",
      },
    });

    // Wait for the file to be processed and become ACTIVE
    while (file.state === "PROCESSING") {
      console.log("File is still processing, waiting...");
      if (!file.name) {
        throw new AppError("Failed to upload video to Gemini", 500);
      }

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
      file = await this.aiClient.files.get({ name: file.name });
    }

    if (file.state === "FAILED") {
      throw new AppError("File processing failed on Gemini", 500);
    }

    console.log(`File is now ${file.state}, ready to use`);
    return file;
  }

  public async getVolleyballVideoEvents(
    filePath: string
  ): Promise<GameEvent[]> {
    // TODO: Finish schema conversion
    console.log(`Uploading video for analysis: ${filePath}`);

    // Upload video to Gemini file manager
    const geminiServerFile = await this.uploadVideo(filePath);

    console.log("Video uploaded to Gemini, generating events...");

    if (!geminiServerFile.uri) {
      throw new AppError("Failed to upload video to Gemini", 500);
    }

    if (!geminiServerFile.mimeType) {
      throw new AppError("Uploaded Gemini file is missing mimeType", 500);
    }

    // Create prompt and schema for event extraction
    const prompt = `Analyze the volleyball game video and extract all game events including serves, points won, and rally starts. For each event, provide the type, timestamp in seconds, and confidence level between 0 and 1. This is raw uneditted footage, so be thorough in your analysis.`;

    const jsonSchema = zodToJsonSchema(GameEventArraySchema as any);

    if (
      jsonSchema &&
      typeof jsonSchema === "object" &&
      "$schema" in jsonSchema
    ) {
      delete (jsonSchema as any).$schema;
    }

    const response = await this.aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: createUserContent([
        createPartFromUri(geminiServerFile.uri, geminiServerFile.mimeType),
        prompt,
      ]),
      config: {
        responseMimeType: "application/json",
        responseSchema: jsonSchema,
      },
    });

    // Parse and validate the response
    const responseText = response.text;

    if (!responseText) {
      throw new AppError("No response text received from Gemini", 500);
    }

    const parsedData = JSON.parse(responseText);
    const events = GameEventArraySchema.parse(parsedData);

    console.log(`Extracted ${events.length} events from video`);

    return events;
  }
}

export const geminiService = new GeminiService();
