"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { signupFormSchema, FormValues } from "@/schemas/signupFormSchema";
import { CheckCircle,XCircle, Eye, EyeOff } from "lucide-react"; // Import Eye and EyeOff icons
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

const SignUpPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State to toggle confirm password visibility

  const form = useForm<FormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
  
      toast.success("Account created!", {
        description: "You can now sign in",
        duration: 2000,
        icon:<CheckCircle className="h-5 w-5"/>
      });
  
      router.push('/signin');
      
    } catch (error) {
      toast.error("Signup failed", {
        description: error instanceof Error 
          ? error.message 
          : 'Please try again later',
          icon: <XCircle className="h-5 w-5" />,
          duration:2000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6">
      <Toaster position="top-right" />
      <div className="w-[90%] max-w-sm sm:max-w-md space-y-6 rounded-lg bg-white p-6 shadow-md sm:p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Create an Account</h2>
          <p className="mt-2 text-sm text-gray-600">Sign up to get started</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="gap-2">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="gap-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="gap-2">
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="gap-2">
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"} // Toggle input type
                        placeholder="Confirm your password"
                        {...field}
                        className="w-full pr-10" // Add padding for the eye icon
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle visibility
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-500" /> // Show EyeOff icon when confirm password is visible
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500" /> // Show Eye icon when confirm password is hidden
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full py-2" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-blue-600 hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;