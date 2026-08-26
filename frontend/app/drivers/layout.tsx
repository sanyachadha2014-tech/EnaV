import React from "react";
import DriverNav from "@/components/driver/DriverNav";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#070B14] text-white pb-20">
      <main className="max-w-md mx-auto p-4">{children}</main>
      <DriverNav />
    </div>
  );
}