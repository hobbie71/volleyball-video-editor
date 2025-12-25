import { type GameEvent } from "@shared/types/gameEvent.types.js";

export interface PostVideoEventsResponse {
  message: string;
  events: GameEvent[];
}
