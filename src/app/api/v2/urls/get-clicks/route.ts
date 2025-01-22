import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { supabase, user } = await getCurrentUser();
  try {
    if (!user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const { slug } = await req.json();
    const clicks = await supabase
      .from("Url")
      .select("clicks")
      .eq("shortUrl", slug);
    console.log(clicks);
    return NextResponse.json(
      {
        clicks: clicks,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "An error occured",
      },
      {
        status: 500,
      }
    );
  }
}
