import type { PostVideoEventsResponse } from "@shared/schemas/videoApi.schema";
import { fetchApi } from "./utils/fetchApi";
import { BASE_API_URL } from "./utils/baseApi";

export const VIDEO_API_URL = BASE_API_URL + "/videos/events";

export const postVideoEvents = async (
  videoFile: File
): Promise<PostVideoEventsResponse> => {
  const formData = new FormData();
  formData.append("video", videoFile);

  return await fetchApi("POST", VIDEO_API_URL, { body: formData });
};
