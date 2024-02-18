import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { updateClicks } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    console.log("route called");
    const slug = req.url.split("/").pop();
    const cachedUrl = await redis.get(slug!);
    if (!slug) {
      return NextResponse.json(
        {
          error: "No slug provided",
        },
        {
          status: 400,
        }
      );
    }
    const url = await db.url.findUnique({
      where: {
        shortUrl: slug,
      },
      select: {
        originalUrl: true,
        clicks: true,
        shortUrl: true,
        id: true,
      },
    });

    if (cachedUrl) {
      await updateClicks(slug, url?.id!);

      return NextResponse.redirect(cachedUrl || "/", {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    if (!url) {
      return NextResponse.json(
        {
          error: "No url found",
        },
        {
          status: 404,
        }
      );
    }
    await updateClicks(slug, url?.id);
    await redis.set(slug, url?.originalUrl);
    return NextResponse.redirect(url?.originalUrl || "/", {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: "An error occurred",
      },
      {
        status: 500,
      }
    );
  }
}
