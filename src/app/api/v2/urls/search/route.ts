import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { supabase, user } = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        error: "You must be logged in to do that",
      },
      {
        status: 401,
      }
    );
  }
  try {
    const { search } = await req.json();
    const { data: urls, error } = await supabase
      .from("Url")
      .select("*")
      .eq("userId", user.id)
      .ilike("originalUrl", `%${search}%`)
      .order("createdAt", { ascending: false });
    // .eq("userId", user.id);
    // const urls = await db.url.findMany({
    //   where: {
    //     AND: [
    //       {
    //         originalUrl: {
    //           contains: search,
    //         },
    //       },
    //       {
    //         userId: user.id,
    //       },
    //     ],
    //   },
    //   orderBy: {
    //     createdAt: "desc",
    //   },
    // });

    return NextResponse.json(
      {
        urls,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: error,
      },
      { status: 500 }
    );
  }
}
