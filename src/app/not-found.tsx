"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFoundPopup() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState<boolean>(true);

  // Auto-close after 20 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(false), 20000);
    return () => clearTimeout(timer);
  }, []);

  return (
    showPopup && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-md animate-fade-in">
        <Card className="bg-[#1e293b] border border-gray-700 shadow-2xl text-center max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center">
              <AlertTriangle className="text-yellow-300 w-14 h-14" />
            </div>
            <CardTitle className="text-5xl font-extrabold text-gray-100 mt-2">
              404
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-xl text-gray-300">Oops Page Not Found</p>
            <p className="text-sm text-gray-400 mt-2">
              The page you are looking for might have been removed or is temporarily unavailable.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                className="bg-slate-700 text-white hover:bg-slate-600"
                onClick={() => router.back()}
              >
                Go Back
              </Button>
              <Button
                className="bg-slate-700 text-white hover:bg-slate-600"
                onClick={() => router.push("/")}
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  );
}
