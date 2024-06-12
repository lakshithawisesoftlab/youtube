import { NextRequest, NextResponse } from "next/server";
import ytdl from "ytdl-core";

import { PassThrough } from "stream";
import db from "@/lib/prismadb";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { searchParams } = new URL(req.url);

  const quality = searchParams.get("quality");

  try {
    const data = await db.url.findUnique({
      where: {
        id: params.id,
      },
    });

    if (data) {
      const videoId = data.url.split("v=")[1].split("&")[0];

      if (!ytdl.validateID(videoId)) {
        return NextResponse.json({
          status: 404,
          message: "URL not found",
        });
      }

      const range = req.headers.get("range");
      if (!range) {
        return new NextResponse("Requires Range header", { status: 416 });
      }

      const videoInfo = await ytdl.getInfo(videoId);

      const getFormatQuality = () => {
        const videoFormats = videoInfo.formats.find(
          (format) => format.qualityLabel === quality
        );

        if (videoFormats) {
          return videoFormats;
        } else return videoInfo.formats[0];
      };

      // const format = ytdl.chooseFormat(videoInfo.formats, {
      //   quality: getFormatQuality(),
      // });

      const format = getFormatQuality();
      const start = Number(range.replace(/\D/g, ""));
      const end = start + 10 ** 6 - 1;
      const contentLength = format?.contentLength;

      const videoStream = ytdl(videoId, {
        format: format,
        range: { start, end },
      });

      const headers = new Headers({
        "Content-Range": `bytes ${start}-${end}/${contentLength}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(end - start + 1),
        "Content-Type": "video/mp4",
      });

      const stream = new PassThrough();
      videoStream.pipe(stream);

      return new NextResponse(stream as any, {
        headers,
        status: 206, // Partial Content
      });
    } else {
      return NextResponse.json({
        status: 404,
        message: "URL not found",
      });
    }
  } catch (error) {
    console.error("Error streaming video:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
