"use client";

import React, { useEffect, useRef } from "react";

import "./icons.css";
import {
  Check,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2,
  Settings,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface VideoPlayerProps {
  id: string;
  videoQuality?: string;
  qualities: string[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  id,
  videoQuality,
  qualities,
}) => {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const volumeSliderRef = useRef<HTMLInputElement>(null);
  const currentTimeRef = useRef<HTMLDivElement>(null);
  const totalTimeRef = useRef<HTMLDivElement>(null);
  const speedTextRef = useRef<HTMLParagraphElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  const [isBuffering, setIsBuffering] = React.useState(false);
  const [skipIndicator, setSkipIndicator] = React.useState({
    show: false,
    direction: "",
  });
  const [qualityClicked, setQualityClicked] = React.useState(false);
  const [quality, setQuality] = React.useState(videoQuality ?? "360p");
  const [openSettings, setOpenSettings] = React.useState(false);

  const router = useRouter();

  // const [isScrubbing, setIsScrubbing] = useState(false);

  let isScrubbing = false;
  let wasPaused: boolean;

  // helper functions
  const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
  });

  function formatDuration(time: number) {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);

    if (hours === 0) {
      return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
    } else {
      return `${hours}:${leadingZeroFormatter.format(
        minutes
      )}:${leadingZeroFormatter.format(seconds)}`;
    }
  }

  // duration
  const handleLoadedVideoData = () => {
    if (videoPlayerRef.current) {
      totalTimeRef.current!.textContent = formatDuration(
        videoPlayerRef.current.duration
      );
    }
  };

  const handleTimeUpdate = () => {
    if (videoPlayerRef.current) {
      currentTimeRef.current!.textContent = formatDuration(
        videoPlayerRef.current.currentTime
      );

      const percent =
        videoPlayerRef.current.currentTime / videoPlayerRef.current.duration;

      timelineContainerRef.current?.style.setProperty(
        "--progress-position",
        percent.toString()
      );
    }
  };

  const skip = (duration: number) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime += duration;
    }
  };

  // captions
  function toggleCaptions() {
    if (videoPlayerRef.current) {
      const captions = videoPlayerRef.current.textTracks[0];
      const isHidden = captions.mode === "hidden";

      captions.mode = isHidden ? "showing" : "hidden";
      videoContainerRef.current?.classList.toggle("captions", isHidden);
    }
  }

  // play pause
  const togglePlay = () => {
    if (videoPlayerRef.current?.paused) {
      videoPlayerRef.current.play();
      videoContainerRef.current?.classList.remove("paused");
    } else {
      videoPlayerRef.current?.pause();
      videoContainerRef.current?.classList.add("paused");
    }
  };

  // playback speed
  const changePlaybackSpeed = () => {
    if (videoPlayerRef.current) {
      let newPlaybackRate = videoPlayerRef.current.playbackRate + 0.25;

      if (newPlaybackRate > 2) newPlaybackRate = 0.25;
      videoPlayerRef.current.playbackRate = newPlaybackRate;
      speedTextRef.current!.textContent = `${newPlaybackRate}x`;
    }
  };

  // theater mode
  const toggleTheaterMode = () => {
    videoContainerRef.current?.classList.toggle("theater");
  };

  // fullscreen mode
  const toggleFullScreenMode = () => {
    if (document.fullscreenElement == null) {
      videoContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // mini player mode
  const toggleMiniPlayerMode = () => {
    if (videoContainerRef.current?.classList.contains("mini-player")) {
      document.exitPictureInPicture();
    } else {
      videoPlayerRef.current?.requestPictureInPicture();
    }
  };

  // volume
  const toggleMute = () => {
    videoPlayerRef.current!.muted = !videoPlayerRef.current!.muted;
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    videoPlayerRef.current!.volume = Number(
      (e.target as HTMLInputElement).value
    );
    videoPlayerRef.current!.muted =
      Number((e.target as HTMLInputElement).value) === 0;
  };

  const handleVolumeChangeByVideo = () => {
    volumeSliderRef.current!.value =
      videoPlayerRef.current?.volume.toString() || "0";
    let volumeLevel;

    const videoPlayerVolume =
      videoPlayerRef.current?.volume !== undefined
        ? videoPlayerRef.current?.volume
        : 0;

    if (videoPlayerRef.current?.muted || videoPlayerVolume === 0) {
      volumeSliderRef.current!.value = "0";
      volumeLevel = "muted";
    } else if (videoPlayerVolume >= 0.5) {
      volumeLevel = "high";
    } else {
      volumeLevel = "low";
    }

    videoContainerRef.current!.dataset.volumeLevel = volumeLevel;
  };

  // timeline update
  const toggleScrubbing = (
    e: React.MouseEvent<HTMLDivElement> | MouseEvent
  ) => {
    if (timelineContainerRef.current) {
      const rect = timelineContainerRef.current.getBoundingClientRect();

      const percent =
        Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;

      isScrubbing = (e.buttons & 1) === 1;
      videoContainerRef.current?.classList.toggle("scrubbing", isScrubbing);

      const video = videoPlayerRef.current as HTMLVideoElement;

      if (isScrubbing) {
        wasPaused = video.paused;
        video.pause();
      } else {
        video.currentTime = percent * video.duration;
        if (!wasPaused) video.play();
      }

      handleTimelineUpdate(e);
    }
  };

  const handleTimelineUpdate = (
    e: React.MouseEvent<HTMLDivElement> | MouseEvent
  ) => {
    if (timelineContainerRef.current) {
      const rect = timelineContainerRef.current.getBoundingClientRect();

      const percent =
        Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;

      if (isScrubbing) {
        e.preventDefault();
        timelineContainerRef.current?.style.setProperty(
          "--progress-position",
          percent.toString()
        );
      }
    }
  };

  // useEffect(() => {
  //   if (videoPlayerRef.current) {
  //     const player = MediaPlayer().create();

  //     player.initialize(videoPlayerRef.current, `/api/stream/${id}`, true);
  //   }
  // }, [id]);

  const handleBuffering = () => {
    setIsBuffering(true);
  };

  const handleCanPlayThrough = () => {
    setIsBuffering(false);
  };

  const handleProgress = () => {
    const video = videoPlayerRef.current;
    if (video && video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const currentTime = video.currentTime;
      const BUFFER_TOLERANCE = 1;

      if (bufferedEnd - currentTime <= BUFFER_TOLERANCE) {
        setIsBuffering(true);
      } else if (isBuffering) {
        setIsBuffering(false);
      }
    }
  };

  useEffect(() => {
    const video = videoPlayerRef.current;
    if (video) {
      video.addEventListener("waiting", handleBuffering);
      video.addEventListener("stalled", handleBuffering);
      video.addEventListener("canplaythrough", handleCanPlayThrough);
      video.addEventListener("progress", handleProgress);
      return () => {
        video.removeEventListener("waiting", handleBuffering);
        video.removeEventListener("stalled", handleBuffering);
        video.removeEventListener("canplaythrough", handleCanPlayThrough);
        video.removeEventListener("progress", handleProgress);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoPlayerRef]);

  useEffect(() => {
    if (videoPlayerRef.current?.paused) {
      videoPlayerRef.current.play();
    }
  }, []);

  useEffect(() => {
    // disable hover
    let global = 3;

    const noMovement = () => {
      if (global === 0) {
        videoContainerRef.current?.classList.remove("hover");
      } else {
        global--;
      }
    };

    const resetGlobal = () => {
      global = 3;
      videoContainerRef.current?.classList.add("hover");
    };

    document.addEventListener("mousemove", resetGlobal);
    document.addEventListener("keydown", resetGlobal);

    const interval = setInterval(() => {
      noMovement();
    }, 1000);

    // mini player
    videoPlayerRef.current?.addEventListener("enterpictureinpicture", () => {
      videoContainerRef.current?.classList.add("mini-player");
    });
    videoPlayerRef.current?.addEventListener("leavepictureinpicture", () => {
      videoContainerRef.current?.classList.remove("mini-player");
    });

    if (videoPlayerRef.current) {
      const captions = videoPlayerRef.current?.textTracks[0];

      captions.mode = "hidden";
    }

    return () => {
      clearInterval(interval);
    };
  }, []);

  document.addEventListener("mouseup", (e) => {
    if (isScrubbing) toggleScrubbing(e);
  });
  document.addEventListener("mousemove", (e) => {
    if (isScrubbing) handleTimelineUpdate(e);
  });
  document.addEventListener("keydown", (e) => {
    const tagName = document.activeElement?.tagName.toLowerCase();

    if (tagName === "input") return;

    switch (e.key.toLowerCase()) {
      case " ":
      case "k":
        if (tagName === "button") return;
        togglePlay();
        break;
      case "f":
        toggleFullScreenMode();
        break;
      case "t":
        toggleTheaterMode();
        break;
      case "i":
        toggleMiniPlayerMode();
        break;
      case "m":
        toggleMute();
        break;
      case "arrowleft":
      case "j":
        skip(-5);
        break;
      case "arrowright":
      case "l":
        skip(5);
        break;
      case "c":
        toggleCaptions();
        break;
    }
  });

  const handleDoubleTap = (
    e: React.MouseEvent<HTMLVideoElement, MouseEvent>
  ) => {
    const videoPlayer = videoPlayerRef.current;
    if (!videoPlayer) return;

    const clickPosition = e.nativeEvent.offsetX;
    const videoWidth = videoPlayer.offsetWidth;

    if (clickPosition > videoWidth / 2) {
      // Skip forward if the double tap was on the right side of the video
      skip(5);
      setSkipIndicator({ show: true, direction: "forward" });
    } else {
      // Skip backward if the double tap was on the left side of the video
      skip(-5);
      setSkipIndicator({ show: true, direction: "backward" });
    }

    // Hide the skip indicator after 1 second
    setTimeout(() => setSkipIndicator({ show: false, direction: "" }), 1000);
  };

  const handleQualityChange = (quality: string) => {
    setQuality(quality);
    setQualityClicked(false);
    setOpenSettings(false);

    const watchedTime = videoPlayerRef.current?.currentTime;
    localStorage.setItem(id, watchedTime ? watchedTime.toString() : "0");

    // router.push(`/${id}?quality=${quality}`);
  };

  useEffect(() => {
    const watchedTime = localStorage.getItem(id);

    if (watchedTime && videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = parseFloat(watchedTime);
      videoPlayerRef.current.pause();
      videoPlayerRef.current.play();
    }
  }, [quality, id]);

  const handleSettingsClose = (state: boolean) => {
    setQualityClicked(state);
    setOpenSettings(false);
  };

  return (
    <div
      ref={videoContainerRef}
      className="video-container hover w-80 h-auto max-h-[calc(100vh-20px)] max-w-full"
      data-volume-level="high"
    >
      <div className="video-controls-container">
        <div
          ref={timelineContainerRef}
          className="timeline-container"
          onMouseMove={(e) => handleTimelineUpdate(e)}
          onMouseDown={(e) => toggleScrubbing(e)}
        >
          <div className="timeline">
            <div className="thumb-indicator"></div>
          </div>
        </div>
        <div className="controls">
          <button onClick={togglePlay}>
            <i className="play-icon play-button-icon size-6 shrink-0" />
            <i className="pause-icon pause-button-icon size-6 shrink-0" />
          </button>
          <div className="volume-container">
            <button onClick={toggleMute}>
              <i className="volume-high-icon volume-high-button-icon size-6 shrink-0" />
              <i className="volume-low-icon volume-low-button-icon size-6 shrink-0" />
              <i className="volume-muted-icon volume-muted-button-icon size-6 shrink-0" />
            </button>
            <input
              ref={volumeSliderRef}
              className="volume-slider"
              type="range"
              min="0"
              max="1"
              step="any"
              onChange={(e) => handleVolume(e)}
            />
          </div>
          <div className="duration-container">
            <div ref={currentTimeRef}>0:00</div>/
            <div ref={totalTimeRef}>0:00</div>
            {/* <div className="flex flex-row items-center gap-[5px] ml-2.5">
              <RotateCcwIcon
                onClick={() => skip(-5)}
                className="size-4 shrink-0 cursor-pointer"
              />
              <RotateCwIcon
                onClick={() => skip(5)}
                className="size-4 shrink-0 cursor-pointer"
              />
            </div> */}
          </div>
          <button onClick={toggleCaptions}>
            <i className="captions-icon caption-btn-icon size-6 shrink-0" />
          </button>
          <button className="wide-btn" onClick={changePlaybackSpeed}>
            <p ref={speedTextRef}>1x</p>
          </button>
          <div>
            <DropdownMenu
              open={openSettings}
              onOpenChange={handleSettingsClose}
            >
              <DropdownMenuTrigger
                onClick={() => setOpenSettings(!openSettings)}
              >
                <Settings className="text-white size-5 shrink-0 cursor-pointer" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="bg-black/50 border-none z-[999999999999999999] w-40 min-h-10 flex items-center"
              >
                {qualityClicked ? (
                  <div
                    onClick={() => setQualityClicked(false)}
                    className="flex items-center justify-between cursor-pointer w-full"
                  >
                    <div className="flex items-center">
                      <Settings2 className="text-white size-4 shrink-0 mr-2.5" />
                      <span className="text-xs font-semibold text-white">
                        Quality
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs font-semibold text-white">
                        {quality}
                      </span>
                      <ChevronRightIcon className="text-white size-4 shrink-0" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      className="flex items-center cursor-pointer py-2"
                      onClick={() => setQualityClicked(true)}
                    >
                      <ChevronLeftIcon className="text-white size-4 shrink-0 cursor-pointer mr-2.5" />
                      <span className="text-xs font-semibold text-white">
                        Quality
                      </span>
                    </div>

                    <div className="flex flex-col mt-2">
                      {qualities.map((q, index) => (
                        <div
                          key={index}
                          onClick={() => handleQualityChange(q)}
                          className="flex items-center px-2 py-2 cursor-pointer w-full"
                        >
                          {quality === q && (
                            <Check className="text-white size-4 shrink-0 mr-2.5" />
                          )}
                          <span
                            className={cn(
                              "text-xs font-semibold text-white",
                              quality !== q && "ml-[26px]"
                            )}
                          >
                            {q}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <button onClick={toggleMiniPlayerMode}>
            <i className="mini-player mini-player-icon size-6 shrink-0" />
          </button>
          <button onClick={toggleTheaterMode} className="max-sm:!hidden">
            <i className="theater-tall-icon tall size-6 shrink-0" />
            <i className="theater-wide-icon wide size-6 shrink-0" />
          </button>
          <button onClick={toggleFullScreenMode}>
            <i className="fullscreen-open-icon open size-6 shrink-0" />
            <i className="fullscreen-close-icon close size-6 shrink-0" />
          </button>
        </div>
      </div>
      <video
        // poster='/images/common/heading-background.webp'
        ref={videoPlayerRef}
        autoPlay={false}
        onClick={togglePlay}
        onVolumeChange={handleVolumeChangeByVideo}
        onLoadedData={handleLoadedVideoData}
        onTimeUpdate={handleTimeUpdate}
        onDoubleClick={handleDoubleTap}
        src={`/api/stream/${id}?quality=${quality}`}
      >
        <track kind="captions" srcLang="en" />
      </video>
      {isBuffering && (
        <Loader2
          className={cn(
            "size-10 animate-spin text-gray-300 absolute top-[calc(50%-20px)] left-1/2"
          )}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
