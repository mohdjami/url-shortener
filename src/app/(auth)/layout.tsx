import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { FC, ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = async ({ children }) => {
  const { supabase, user } = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }
  return <div className="bg-slate-200 mt-32 p-10 rounded-md">{children}</div>;
};

export default AuthLayout;
