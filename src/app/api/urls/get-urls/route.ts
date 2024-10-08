import db from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

export async function GET(req: Request) {
  const supabase = createClient();
  try {
    console.log("route called");
    const { supabase, user } = await getCurrentUser();

    const { data: urls, error } = await supabase
      .from("Url")
      .select("*")
      .eq("userId", user.id);
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
