import type {
  GetGameEventsResponse,
  GetNewGameIdResponse,
} from "@shared/schemas/gameApi.schema";
import { BASE_API_URL } from "./utils/baseApi";
import { fetchApi } from "./utils/fetchApi";

export const GAME_API_URL = BASE_API_URL + "/games";

export const getNewGameIdApi = async (): Promise<GetNewGameIdResponse> => {
  const url = `${GAME_API_URL}/newGameId`;
  return await fetchApi<{ gameId: string }>("GET", url);
};

export const getVideoEventsApi = async (
  gameId: string,
  videoPath: string
): Promise<GetGameEventsResponse> => {
  const queryParams = new URLSearchParams();

  queryParams.append("gameId", gameId);
  queryParams.append("videoPath", videoPath);

  const url = `${GAME_API_URL}/events?${queryParams.toString()}`;

  const response = await fetchApi<GetGameEventsResponse>("GET", url);

  return response;
};
