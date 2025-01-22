import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

import { z } from "zod";
import { rateLimiting } from "@/lib/rate-limiting";
import { revalidatePath } from "next/cache";
import { URLShortenerService } from "@/services/url.service";

export async function POST(req: NextRequest) {
  const urlService = new URLShortenerService();
  try {
    const { supabase, user } = await getCurrentUser();
    const ip = req.headers.get("x-forwarded-for") || req.ip;
    await rateLimiting(ip!);
    //recieving credentials from the client
    let { url, code } = await req.json();
    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }
    if (!url) {
      return NextResponse.json(
        {
          error: "url is required",
        },
        {
          status: 400,
        }
      );
    }
    //if no code then create one
    const slug = await urlService.createShortURL(url, user.id, code);

    revalidatePath("/dashboard");
    return NextResponse.json({
      code: slug,
    });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.errors[0].message!,
        },
        {
          status: 500,
        }
      );
    }
    return NextResponse.json(
      {
        error: "Something went very wrong",
      },
      {
        status: 500,
      }
    );
  }
}
