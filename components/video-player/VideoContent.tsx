"use client";

import React, { useState } from "react";

import VideoPlayer from "@/components/video-player/VideoPlayer";

import "./icons.css";
import Image from "next/image";

interface VideoContentProps {
  id: string;
  thumbnail: string;
  videoQuality: string;
  qualities: string[];
}

const VideoContent: React.FC<VideoContentProps> = ({
  id,
  thumbnail,
  videoQuality,
  qualities,
}) => {
  const [isPaused, setIsPaused] = useState(true);

  const reOrderQualities = () => {
    const order = [
      "2160p",
      "1440p",
      "1080p",
      "720p",
      "480p",
      "360p",
      "240p",
      "144p",
    ];

    return qualities
      .sort((a, b) => order.indexOf(a) - order.indexOf(b))
      .filter((value, index, self) => self.indexOf(value) === index);
  };

  const orderedQualities = reOrderQualities();

  return isPaused ? (
    <div className="min-h-[215px] lg:min-h-[300px] w-full lg:w-[calc(50%-50px)] relative">
      <Image
        src={thumbnail}
        alt="Video Thumbnail"
        width={2000}
        height={2000}
        className="size-full object-cover"
      />
      <i
        onClick={() => setIsPaused(false)}
        className="video-play-icon absolute top-[calc(50%-30px)] left-[calc(50%-30px)] cursor-pointer size-[60px] shrink-0"
      />
    </div>
  ) : (
    <VideoPlayer
      id={id}
      videoQuality={videoQuality}
      qualities={orderedQualities}
    />
  );
};

export default VideoContent;
