"use client";

import React from "react";

interface VideoPlayerProps {
  id: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ id }) => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <video
        id="myVideo"
        src={`/api/stream/${id}`}
        controls
        autoPlay
        className="w-full h-screen"
      ></video>
    </div>
  );
};

export default VideoPlayer;
