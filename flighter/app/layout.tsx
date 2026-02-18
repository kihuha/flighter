import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "./QueryProvider";
import { Header } from "@/components/header";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flighter - Book flights from Kenya to the world",
  description:
    "Flighter is your go-to flight booking platform for seamless travel experiences. We offer a wide range of flights from Kenya to destinations around the world, ensuring you find the perfect flight for your next adventure. With our user-friendly interface and competitive prices, booking your next trip has never been easier. Explore our extensive selection of flights and discover new destinations with Flighter today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
