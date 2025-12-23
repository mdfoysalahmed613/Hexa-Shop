import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/providers/user-provider";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hexashop.foysal.me"),
  title: "Hexa Shop - Premium Essentials for the Modern Man",
  description: "Discover curated menswear and accessories crafted with premium materials and timeless design. Hexa Shop offers shirt, pants, wallets, and everyday essentials built to elevate your style and confidence.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        {/* Theme provider controls dark/light mode across the app */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* QueryProvider wraps TanStack Query for data fetching */}
          <QueryProvider>
            {/* UserProvider subscribes to Supabase auth state on the client */}
            <UserProvider>
              {children}
              <Toaster position="top-center" richColors />
            </UserProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
