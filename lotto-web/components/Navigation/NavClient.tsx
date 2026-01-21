"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiMenuAlt3, HiX, HiUser, HiLogout, HiHome } from "react-icons/hi";
import { NAV_ITEMS } from "@/constants/Nav";
import CompanyLogo from "@/public/companyLogo.png";
import { logout } from "@/services/Auth";

export default function NavbarClient({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false); // mobile menu
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // profile dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  const firstLetter = user?.firstName?.charAt(0)?.toUpperCase() || "U";
  const dashboardURL = user ? `/${user.role.toLowerCase()}/dashboard` : "/";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    setIsOpen(false);
  };

  return (
    <nav className="absolute top-0 left-0 w-full z-50 bg-transparent px-4 md:px-[105px] py-6">
      <div className="bg-white border border-primary/20 flex items-center justify-between rounded-full px-6 py-3 mx-auto max-w-[1800px] shadow-md">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={'/logo.png'}
            alt="Company Logo"
            width={100}
            height={55}
            className="object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {NAV_ITEMS.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="text-gray-800 text-lg font-medium hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop: User State */}
        <div className="hidden md:block relative" ref={dropdownRef}>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen((p) => !p)}
                className="flex items-center gap-3 bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-full transition-all cursor-pointer"
              >
                <div className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {firstLetter}
                </div>
                <span className="text-gray-800 font-medium">
                  Hi, {user.firstName}
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
                  
                  {/* Dashboard */}
                  <Link
                    href={dashboardURL}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50"
                  >
                    <HiHome className="text-xl text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-800">Dashboard</p>
                      <p className="text-sm text-gray-500">
                        Go to your dashboard
                      </p>
                    </div>
                  </Link>

                  {/* Profile */}
                  <Link
                    href="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50"
                  >
                    <HiUser className="text-xl text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-800">My Profile</p>
                      <p className="text-sm text-gray-500">
                        Account settings
                      </p>
                    </div>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-6 py-4 hover:bg-red-50 w-full text-left"
                  >
                    <HiLogout className="text-xl text-red-600" />
                    <div>
                      <p className="font-medium text-red-600">Logout</p>
                      <p className="text-sm text-gray-500">
                        Sign out of account
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="bg-primary text-white px-6 py-2.5 text-lg rounded-full hover:bg-primary/90 transition-all"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen((p) => !p)}
          className="md:hidden text-gray-800 text-3xl"
        >
          {isOpen ? <HiX /> : <HiMenuAlt3 />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-[90px] left-0 w-full bg-white shadow-2xl rounded-2xl py-6 px-4 flex flex-col items-center gap-6 md:hidden animate-slideDown">
          {NAV_ITEMS.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="text-gray-800 text-lg font-medium hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}

          {user ? (
            <div className="w-full space-y-3 pt-4 border-t border-gray-200">
              {/* Dashboard */}
              <Link
                href={dashboardURL}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl"
              >
                <HiHome className="text-xl text-gray-600" />
                <span className="font-medium">Dashboard</span>
              </Link>

              {/* Profile */}
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl"
              >
                <HiUser className="text-xl text-gray-600" />
                <span className="font-medium">My Profile</span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl w-full text-left"
              >
                <HiLogout className="text-xl text-red-600" />
                <span className="font-medium text-red-600">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/sign-in"
              onClick={() => setIsOpen(false)}
              className="bg-primary text-white w-[140px] text-center py-3 rounded-full hover:bg-primary/90 transition-all"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
