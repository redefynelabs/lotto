"use client";

import { logout } from "@/services/Auth";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { HiLogout, HiUser } from "react-icons/hi";

const Header = () => {
  const [userData, setUserData] = useState<{
    name: string;
    role: string;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);


  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        // Fetch user data from localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setUserData({
                    name: user.firstName,
                    role: user.role,
                });
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, []);

  useEffect(() => {
    // Fetch user data from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserData({
          name: user.name || user.username || "User",
          role: user.role || "Guest",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const userJson =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userJson ? JSON.parse(userJson) : null;

  const firstLetter = user?.firstName?.charAt(0).toUpperCase() || "U";

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-row items-center justify-between bg-white py-4 px-5 w-full">
      <div className="bg-[#F5F6FA] border border-[#D5D5D5] rounded-full max-w-sm w-full flex items-center px-4 py-1">
        <FiSearch className="text-black/50 text-lg" />

        <input
          type="text"
          placeholder="Search"
          className="ml-3 bg-transparent outline-none w-full text-[#202224]"
        />
      </div>

      {userData && (
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 md:bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-full transition-all duration-200 cursor-pointer"
          >
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
              {firstLetter}
            </div>
            <span className="text-gray-800 font-medium hidden md:inline-block">
              Hi, {user.firstName}
            </span>
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <Link
                href="/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <HiUser className="text-xl text-gray-600" />
                <div>
                  <p className="font-medium text-gray-800">My Profile</p>
                  <p className="text-sm text-gray-500">Account settings</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-6 py-4 hover:bg-red-50 transition-colors w-full text-left"
              >
                <HiLogout className="text-xl text-red-600" />
                <div>
                  <p className="font-medium text-red-600">Logout</p>
                  <p className="text-sm text-gray-500">Sign out of account</p>
                </div>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
