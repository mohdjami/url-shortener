"use client";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import GoogleSignInButton from "../buttons/GoogleSignInButton";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import GithubSignInButton from "../buttons/GithubSignInButton";
import { useState } from "react";
import { Icons } from "../Icons";
import { SignInFormFormSchema } from "@/lib/validations/forms";
import { createClient } from "@/supabase/client";
const SignInForm = () => {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof SignInFormFormSchema>>({
    resolver: zodResolver(SignInFormFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleError = (error: any) => {
    toast({
      title: "Error",
      description: "Oops Something went wrong",
      variant: "destructive",
    });
  };

  const onSubmit = async (values: z.infer<typeof SignInFormFormSchema>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("User")
        .select("*")
        .eq("email", values.email)
        .single();
      if (error || !data) {
        console.error("User does not exist in the custom table:", error);
        setLoading(false);
        return;
      }
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
      if (data && authError) {
        //if user is available but it is not in the auth table
        //then we need to create a new user in the auth table
        //but we need to check the password before creating a new user in the auth table

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword(
          {
            email: values.email,
            password: values.password,
          },
          
        );
      }
      if (authError) {
        toast({
          title: "Either email or password is wrong",
          description:
            "Please sign up if you are not a user or click on forgot password t reset your password",
          variant: "destructive",
        });
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          });
        setLoading(false);
        router.push("/error");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setLoading(false);
      handleError(error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full py-2 space-y-2 md:space-y-2"
      >
        <div className="space-y-2 md:space-y-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-center text-sm text-gray-600 mt-2">
                  Email
                </FormLabel>
                <FormControl>
                  <Input placeholder="mail@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-center text-sm text-gray-600 mt-2">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          className="flex items-center w-full mt-6"
          type="submit"
          variant="outline"
        >
          {loading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Sign in"
          )}{" "}
        </Button>
      </form>
      <Link
        className="text-red-500 hover:underline text-xs flex justify-end"
        href="/forgot-password"
      >
        Forgot Password
      </Link>

      <div className="mx-auto my-4 flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:flex-grow before:bg-stone-400 after:ml-4 after:block after:h-px after:flex-grow after:bg-stone-400 dark:text-slate-950">
        or
      </div>
      <div style={{ marginBottom: "10px" }}>
        <GoogleSignInButton>Sign in with Google</GoogleSignInButton>
      </div>
      <GithubSignInButton>Sign in with Github</GithubSignInButton>
      <p className="text-center text-sm text-gray-600 mt-2">
        If you don&apos;t have an account, please&nbsp;
        <Link className="text-blue-500 hover:underline" href="/sign-up">
          Sign up
        </Link>
      </p>
    </Form>
  );
};

export default SignInForm;
