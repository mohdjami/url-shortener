import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { supabase, user } = await getCurrentUser();
    if (!user)
      return NextResponse.json({
        error: "You must be logged in to do that",
      });
    // = await db.url.findMany();
    const { data: urls, error } = await supabase.from("Url").select("*");
    if (error) {
      console.log(error);
      return NextResponse.json({
        error: "An error occured",
      });
    }
    // const urls = await supabase.from("Url").select("*");
    // console.log(urls);
    // const aggregate = await db.url.aggregate({
    //   where: {
    //     userId: user?.id,
    //   },
    //   orderBy: {
    //     clicks: "asc",
    //   },
    // });
    // console.log(aggregate);
    return NextResponse.json({
      urls,
    });
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
