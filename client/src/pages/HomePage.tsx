import { useState } from "react";
import { FileInput } from "../components/FileInput";
import { ThemeToggle } from "../components/ThemeToggle";
import Page from "../components/ui/Page";
import { compressVideoApi } from "../api/videoApi";
import { getNewGameIdApi, getVideoEventsApi } from "../api/gameApi";
import type { GameEvent } from "@vve/shared/types/gameEvent.types.js";

const HomePage = () => {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [videoViewUrl, setVideoViewUrl] = useState<string>("");
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const handleFileUpload = async (file: File) => {
    // Create blob URL for local video playback
    const blobUrl = URL.createObjectURL(file);
    setVideoViewUrl(blobUrl);

    // Get new game ID
    console.log("Requesting new game ID...");
    const newGameIdResponse = await getNewGameIdApi();
    console.log("New Game ID:", newGameIdResponse.gameId);
    const gameId = newGameIdResponse.gameId;

    // Compress video
    console.log("Uploading and compressing video...");
    const compressedVideoResponse = await compressVideoApi(file, gameId, 0);
    console.log(
      "Compressed Video URL:",
      compressedVideoResponse.compressedVideoUrl
    );

    // Get video events
    console.log("Requesting video events...");
    const videoEventsResponse = await getVideoEventsApi(
      gameId,
      compressedVideoResponse.compressedVideoUrl
    );
    console.log("Video Events Response:", videoEventsResponse);

    // Update state
    setEvents(videoEventsResponse.events || []);
  };

  return (
    <Page className="flex flex-col justify-center items-center gap-8 p-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-text-primary">
          Volleyball Video Editor
        </h1>
        <ThemeToggle />
      </div>

      {!videoViewUrl && (
        <div className="max-w-40 max-h-40">
          <FileInput accept="video/*" onUploadComplete={handleFileUpload} />
        </div>
      )}

      {videoViewUrl && (
        <div className="w-full max-w-4xl">
          <video
            ref={setVideoRef}
            src={videoViewUrl}
            controls
            className="w-full rounded-lg shadow-lg"
          />
        </div>
      )}

      {events.length > 0 && (
        <div className="w-full max-w-4xl max-h-32 overflow-auto">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Events</h2>
          <div className="space-y-2">
            {events.map((event, index) => (
              <button
                key={index}
                onClick={() => {
                  if (videoRef) {
                    videoRef.currentTime = event.timestamp;
                    videoRef.play();
                  }
                }}
                className="w-full p-4 bg-surface rounded-lg hover:bg-surface-elevated transition-colors text-left">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-text-primary">
                    {event.type.replace("_", " ").toUpperCase()}
                  </span>
                  <span className="text-text-secondary">
                    {event.timestamp.toFixed(2)}s
                  </span>
                </div>
                <div className="text-sm text-text-secondary mt-1">
                  Confidence: {(event.confidence * 100).toFixed(1)}%
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </Page>
  );
};

export default HomePage;
