"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiMenuAlt3, HiX, HiUser, HiLogout, HiViewGrid } from "react-icons/hi";
import { NAV_ITEMS } from "../../constants/Nav";
import { logout } from "@/services/Auth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Local storage user
  const userJson =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userJson ? JSON.parse(userJson) : null;

  const firstLetter = user?.firstName?.charAt(0).toUpperCase() || "U";
  const role = user?.role?.toLowerCase?.() ?? "agent";

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    setIsOpen(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handler);
    }

    return () => document.removeEventListener("mousedown", handler);
  }, [isDropdownOpen]);

  return (
    <nav className="absolute top-0 left-0 w-full z-50 bg-transparent px-4 md:px-[105px] py-6">
      <div className="bg-white border border-primary/20 flex items-center justify-between rounded-full px-6 py-3 mx-auto max-w-[1800px]">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <Image src={'/logo.png'} alt="Logo" width={100} height={55} />
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-10">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-800 text-lg font-medium hover:text-primary transition"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* DESKTOP USER */}
        <div className="hidden md:block relative" ref={dropdownRef}>
          {user ? (
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-full"
            >
              <div className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                {firstLetter}
              </div>
              <span className="text-gray-800">Hi, {user.firstName}</span>
            </button>
          ) : (
            <Link href="/sign-in" className="bg-primary text-white px-6 py-2 rounded-full">
              Login
            </Link>
          )}
        </div>

        {/* MOBILE BUTTONS */}
        <div className="md:hidden flex items-center gap-4">
          {/* Menu */}
          <button onClick={() => setIsOpen(!isOpen)} className="text-3xl">
            {isOpen ? <HiX /> : <HiMenuAlt3 />}
          </button>

          {/* Avatar */}
          {user ? (
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                {firstLetter}
              </div>
            </button>
          ) : (
            <Link href="/sign-in" className="px-4 py-2 bg-primary text-white rounded-full">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="absolute top-[90px] left-0 w-full md:hidden z-40">
          <div className="bg-white shadow-2xl rounded-2xl py-6 px-5 mx-4 border">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block text-gray-800 text-lg py-2 hover:bg-gray-100 rounded-lg"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* SINGLE DROPDOWN (works for both mobile & desktop) */}
      {isDropdownOpen && user && (
        <div
          ref={dropdownRef}
          className="absolute right-4 top-[90px] w-60 bg-white rounded-2xl shadow-xl border z-[9999]"
        >
          <Link
            href={`/${role}/dashboard`}
            onClick={() => setIsDropdownOpen(false)}
            className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50"
          >
            <HiViewGrid className="text-xl text-primary" />
            Dashboard
          </Link>

          <Link
            href="/profile"
            onClick={() => setIsDropdownOpen(false)}
            className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50"
          >
            <HiUser className="text-xl text-gray-600" />
            My Profile
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-4 hover:bg-red-50 w-full text-left"
          >
            <HiLogout className="text-xl text-red-600" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
