import { z } from "zod";

/**
 * Core event types for volleyball video analysis.
 * These are the events that the AI will extract from video footage.
 */

export const GAME_EVENT_TYPES = ["serve", "point_won", "rally_start"] as const;

export type EventType = (typeof GAME_EVENT_TYPES)[number];

export const GameEventSchema = z
  .object({
    type: z.enum(GAME_EVENT_TYPES).describe("Type of game event"),
    timestamp: z
      .number()
      .nonnegative()
      .describe("Timestamp of the event in seconds"),
    confidence: z
      .number()
      .min(0)
      .max(1)
      .describe("Confidence level of the event detection"),
  })
  .describe("GameEvent");

export type GameEvent = z.infer<typeof GameEventSchema>;
export const GameEventArraySchema = z.array(GameEventSchema);
