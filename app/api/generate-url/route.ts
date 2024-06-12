import db from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const { url } = body;

  if (!url) return new Response("Invalid Request", { status: 401 });

  try {
    const data = await db.url.create({
      data: {
        url: url,
      },
    });
    return NextResponse.json({
      status: "200",
      message: "URL created successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: "500",
      message: "Internal Server Error",
    });
  }
};
