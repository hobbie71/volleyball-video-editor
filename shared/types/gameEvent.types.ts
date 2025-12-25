/**
 * Core event types for volleyball video analysis.
 * These are the events that the AI will extract from video footage.
 */

export const GAME_EVENT_TYPES = ["rally_start", "rally_end", "serve"];

export type EventType = (typeof GAME_EVENT_TYPES)[number];

/**
 * An event extracted from video analysis.
 * For the MVP (no database), we only need the AI-returned data.
 */
export interface GameEvent {
  type: EventType;
  timestamp: number; // Seconds into the video
  confidence?: number; // AI confidence score (0-1)
}
