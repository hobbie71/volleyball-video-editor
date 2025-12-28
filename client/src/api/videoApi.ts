import { fetchApi } from "./utils/fetchApi";
import { BASE_API_URL } from "./utils/baseApi";
import type { PostCompressVideoResponse } from "@shared/schemas/videoApi.schema";

export const VIDEO_API_URL = BASE_API_URL + "/videos";

export const compressVideoApi = async (
  videoFile: File,
  gameId: string,
  videoIndex: number
): Promise<PostCompressVideoResponse> => {
  const url = `${VIDEO_API_URL}/compress/${gameId}/${videoIndex}`;
  const formData = new FormData();

  // Append video file with field name 'video' as expected by the server
  formData.append("video", videoFile, `${videoIndex}.mp4`);

  const response = await fetchApi<PostCompressVideoResponse>("POST", url, {
    body: formData,
  });

  return response;
};
