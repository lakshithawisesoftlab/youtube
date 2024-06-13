import db from "@/lib/prismadb";

import { NextRequest, NextResponse } from "next/server";
import ytdl from "ytdl-core";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const data = await db.url.findUnique({
      where: {
        id: params.id,
      },
    });

    if (data) {
      const info = await ytdl.getInfo(data.url);

      // Extract relevant video info
      const videoInfo = {
        title: info.videoDetails,
        thumbnail:
          info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]
            .url,
        qualities: info.formats
          .filter((format) => format.hasVideo && format.qualityLabel !== "144p")
          .map((format) => format.qualityLabel),
      };

      return NextResponse.json({
        status: "200",
        message: "URL found",
        data: videoInfo,
      });
    } else {
      return NextResponse.json({
        status: "404",
        message: "URL not found",
      });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: "500",
      message: "Internal Server Error",
    });
  }
};
