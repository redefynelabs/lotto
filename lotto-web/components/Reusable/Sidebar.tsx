"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CompanyLogo } from "./Images";
import Image from "next/image";

// Icons
import { LuUserRound } from "react-icons/lu";
import { CiDiscount1, CiMoneyBill, CiReceipt } from "react-icons/ci";
import { LiaGiftSolid } from "react-icons/lia";
import { HiDocumentReport, HiMenuAlt3, HiX } from "react-icons/hi";
import { RiCalendarScheduleFill, RiDashboard3Line } from "react-icons/ri";
import { MdOutlinePriceChange } from "react-icons/md";
import { IoWalletOutline } from "react-icons/io5";
import { BsCashCoin } from "react-icons/bs";

interface SidebarProps {
  role: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // ---------------------------------------
  // NAVIGATION CONFIG
  // ---------------------------------------
  const getNavItems = () => {
    if (role === "admin") {
      return [
        {
          icon: RiDashboard3Line,
          title: "Dashboard",
          href: "/admin/dashboard",
          items: [],
        },
        {
          icon: BsCashCoin,
          title: "Bid",
          href: "/bid",
          items: [],
        },

        // ------------ MANAGE AGENTS ------------
        {
          title: "Agent Management",
          items: [
            { icon: LuUserRound, title: "Agents", href: "/admin/agents" },
            {
              icon: CiReceipt,
              title: "Commission",
              href: "/admin/commission",
            },
          ],
        },

        // ------------ MANAGE BIDDING ------------
        {
          title: "Bidding Management",
          items: [
            {
              icon: RiCalendarScheduleFill,
              title: "Manage Slots",
              href: "/admin/manage-slots",
            },
            {
              icon: LiaGiftSolid,
              title: "Live Draw",
              href: "/admin/live-draw",
            },
            {
              icon: HiDocumentReport,
              title: "Report",
              href: "/admin/report",
            },
          ],
        },

        // ------------ WALLET MANAGEMENT ------------
        {
          title: "Wallet Management",
          items: [
            {
              icon: IoWalletOutline,
              title: "Pending Deposits",
              href: "/admin/wallet/deposits",
            },
            {
              icon: MdOutlinePriceChange,
              title: "Pay Commission",
              href: "/admin/wallet/commission",
            },
            {
              icon: LiaGiftSolid,
              title: "Winning Payments",
              href: "/admin/wallet/winning-payment",
            }
          ],
        },

        {
          title : "System Settings",
          items:[
             {
              icon: CiDiscount1,
              title: "Settings",
              href: "/admin/settings",
            },
          ]
        }
      ];
    }

    // ---------------------------------------
    // AGENT NAVIGATION
    // ---------------------------------------
    if (role === "agent") {
      return [
        {
          icon: RiDashboard3Line,
          title: "Dashboard",
          href: "/agent/dashboard",
          items: [],
        },
        {
          icon: BsCashCoin,
          title: "Bid",
          href: "/bid",
          items: [],
        },
        {
          icon: CiReceipt,
          title: "Bid History",
          href: "/agent/bid-history",
          items: [],
        },
        {
          icon: IoWalletOutline,
          title: "Wallet",
          href: "/agent/wallet",
          items: [],
        },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  const SidebarContent = () => (
    <>
      <Link href={'/'} className="p-4 flex items-center justify-center">
        <Image src={CompanyLogo} alt="32 win" className="w-16" />
      </Link>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <li key={index}>
              {/* SECTION HEADER OR DIRECT LINK */}
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 mx-4 rounded-md text-sm font-medium relative
                    ${pathname === item.href
                      ? 'bg-primary text-white before:content-[""] before:absolute before:-left-4 before:top-0 before:bottom-0 before:w-1 before:bg-primary before:rounded-r-md'
                      : "text-[#202224] hover:bg-gray-50"
                    }`}
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  {item.title}
                </Link>
              ) : (
                <>
                  <div className="mx-4 mt-4 mb-2 border-t border-[#e8e8e8]"></div>
                  <div className="px-4 py-2 text-xs font-semibold text-[#202224]">
                    {item.title}
                  </div>
                </>
              )}

              {/* SUB ITEMS */}
              {item.items &&
                item.items.map((sub, i) => (
                  <Link
                    href={sub.href}
                    key={i}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 mx-4 rounded-md text-sm relative
                      ${pathname === sub.href
                        ? 'bg-primary text-white before:content-[""] before:absolute before:-left-4 before:top-0 before:bottom-0 before:w-1 before:bg-primary before:rounded-r-md'
                        : "text-[#202224] hover:bg-gray-50"
                      }`}
                  >
                    {sub.icon && <sub.icon className="w-5 h-5" />}
                    {sub.title}
                  </Link>
                ))}
            </li>
          ))}
        </ul>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile: Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md border border-[#E8E8E8]"
      >
        {isMobileMenuOpen ? (
          <HiX className="w-6 h-6 text-[#202224]" />
        ) : (
          <HiMenuAlt3 className="w-6 h-6 text-[#202224]" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-[241px] bg-white border-r border-[#E8E8E8] z-40 transform transition-transform duration-300 ease-in-out flex flex-col
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-[241px] bg-white border-r border-[#E8E8E8] h-full flex-col">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
