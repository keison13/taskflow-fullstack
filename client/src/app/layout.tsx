import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "A simple project and task manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <div className="min-h-screen md:flex">
          <Sidebar />

          <div className="min-w-0 flex-1">
            <Header />
            <main className="p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
