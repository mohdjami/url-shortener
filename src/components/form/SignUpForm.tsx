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
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import GithubSignInButton from "../buttons/GithubSignInButton";
import { useState } from "react";
import { Icons } from "../Icons";
import { SignUpFormFormSchema } from "@/lib/validations/forms";
import { createClient } from "@/supabase/client";
const SignUpForm = () => {
  const supabase = createClient();

  const router = useRouter();
  const { toast } = useToast();
  const [loading, isLoading] = useState(false);
  const form = useForm<z.infer<typeof SignUpFormFormSchema>>({
    resolver: zodResolver(SignUpFormFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof SignUpFormFormSchema>) => {
    try {
      isLoading(true);
      const { data: authData, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });
      if (error) {
        console.log(error);
      }
      isLoading(false);

      try {
        const { data: UserExists, error: UserExistsError } = await supabase
          .from("User")
          .select("*")
          .eq("email", values.email)
          .single();
        if (UserExists) {
          isLoading(false);
          router.push("/sign-in");
          return;
        }
        const { data: userData, error: userError } = await supabase
          .from("User")
          .insert({
            id: authData.user?.id, // Use the user ID from the authentication data
            email: values.email,
            createdAt: new Date().toISOString(),
            username: values.username,
            // Add other fields as necessary
          });
        if (userError) {
          // console.error("Error adding user to custom table:", userError);
          isLoading(false);
          return;
        }
        router.push("/sign-in");
        toast({
          title:
            "A verification email has been sent to your email address. It may take some time to appear in your inbox.",
          variant: "default",
        });
      } catch (error) {
        isLoading(false);
        toast({
          title: "Error, try again",
          description: "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      isLoading(false);
      toast({
        title: "User Already Exists Or Something Went wrong",
        variant: "destructive",
      });
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
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="w-full mt-4 mb-1 md:mt-8 lg:mt-10 block lg:hidden dark:text-gray-600">
                  Username
                </FormLabel>
                <FormLabel className="md:block hidden dark:text-gray-600  md:mb-1">
                  Username
                </FormLabel>
                <FormControl>
                  <Input placeholder="johndoe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-gray-600">Email</FormLabel>
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
                <FormLabel className=" dark:text-gray-600">Password</FormLabel>
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-gray-600">
                  Re-Enter your password
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Re-Enter your password"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          className="flex items-center w-full mt-6 md:block hidden  "
          type="submit"
          variant="outline"
        >
          {loading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Sign up"
          )}{" "}
        </Button>
        <Button
          className="flex items-center w-full mt-6"
          type="submit"
          variant="outline"
        >
          {loading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Sign up"
          )}{" "}

        </Button>
      </form>
      <div className="mx-auto my-4 flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:flex-grow before:bg-stone-400 after:ml-4 after:block after:h-px after:flex-grow after:bg-stone-400 dark:text-gray-600 ">
        or
      </div>
      <div style={{ marginBottom: "10px" }}>
        <GoogleSignInButton>Sign in with Google</GoogleSignInButton>
      </div>
      <GithubSignInButton>Sign in with Github</GithubSignInButton>{" "}
      <p className="text-center text-sm text-gray-600 mt-2">
        If you already have an account, please&nbsp;
        <Link className="text-blue-500 hover:underline" href="/sign-in">
          Sign in
        </Link>
      </p>
    </Form>
  );
};

export default SignUpForm;
