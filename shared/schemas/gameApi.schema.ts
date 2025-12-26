import type { GameEvent } from "../types/gameEvent.types.js";

export interface GetNewGameIdResponse {
  gameId: string;
}

export interface GetGameEventsResponse {
  message: string;
  events: GameEvent[];
}
