import React from "react";

import VideoContent from "@/components/video-player/VideoContent";
import { getVideoInfo } from "@/actions/get-video-info";

interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    quality: string;
  };
}

const Page: React.FC<PageProps> = async ({ params, searchParams }) => {
  const data = await getVideoInfo(params.id);

  return (
    <div className="w-full h-screen flex items-center justify-center px-2.5">
      <VideoContent
        id={params.id}
        thumbnail={data?.thumbnail}
        videoQuality={searchParams.quality}
        qualities={data?.qualities}
      />
    </div>
  );
};

export default Page;
