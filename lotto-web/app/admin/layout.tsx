// app/admin/layout.tsx
import Sidebar from "@/components/Reusable/Sidebar";
import Header from "@/components/Reusable/Header";
import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar role="admin" />
      <main
        data-lenis-prevent
        className="grow bg-[#F5F6FA] flex flex-col overflow-y-auto"
      >
        <Header />
        <div>{children}</div>
      </main>
    </div>
  );
}
