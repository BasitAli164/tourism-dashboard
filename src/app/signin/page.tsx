"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { siginFormSchema, FormValues } from "@/schemas/siginFormSchema";
import { CheckCircle, XCircle, Eye, EyeOff } from "lucide-react"; // Import Eye and EyeOff icons
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";
import Link from "next/link";
import { signIn } from "next-auth/react";

// Dummy user data
const users = [
  { email: "admin@mountaintravels.com", password: "admin123" },
  { email: "user@example.com", password: "password456" },
];

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const form = useForm<FormValues>({
    resolver: zodResolver(siginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setIsLoading(true);
    try {
      // Call signIn api endpoint
      const response = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if(response?.error){
        throw new Error(response.error)
      }
      // Successful login
    toast.success("Login Successful", {
      description: "Welcome back!",
      icon: <CheckCircle className="h-5 w-5" />,
      duration: 2000,
    });

    router.push("/dashboard");
    } catch (error:any) {
      toast.error("Login Failed", {
        description: error.message || "Invalid email or password",
        icon: <XCircle className="h-5 w-5" />,
        duration: 2000,
      });
    }finally{
      setIsLoading(false)
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md sm:p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in to your account
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      {...field}
                      className="w-full"
                    />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"} // Toggle input type
                        placeholder="Enter your password"
                        {...field}
                        className="w-full pr-10" // Add padding for the eye icon
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowPassword(!showPassword)} // Toggle visibility
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-500" /> // Show EyeOff icon when password is visible
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500" /> // Show Eye icon when password is hidden
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Don&#39;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
}
