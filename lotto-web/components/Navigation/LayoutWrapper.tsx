"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navigation/Navbar";
import Footer from "@/components/Navigation/Footer";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Define routes that should hide Navbar and Footer
  const hideLayout = pathname.startsWith("/admin") || 
                     pathname.startsWith("/agent") || 
                     ["/sign-in", "/sign-up", "/forgot-password"].includes(pathname);

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}
