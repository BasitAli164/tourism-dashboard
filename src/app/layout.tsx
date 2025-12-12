// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers"; // ✅ import client wrapper
import { HomePage } from "./page"; // ⚠️ still unconventional but preserved

export const metadata: Metadata = {
  title: "Mountain Travels Admin Dashboard",
  description: "Admin dashboard for Mountain Travels Pakistan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <HomePage>{children}</HomePage> {/* ⚠️ Still unconventional */}
        </Providers>
      </body>
    </html>
  );
}
