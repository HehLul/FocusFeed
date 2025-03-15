// components/common/FeedHeader.jsx
import React, { useState } from "react";
import Link from "next/link";

const FeedHeader = ({ userEmail, onSignOut }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo and title */}
          <Link href="/feed" className="flex items-center">
            <h1 className="text-xl font-bold mr-2">
              <span className="text-green-400">Focus</span>Feed
            </h1>
          </Link>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="flex items-center text-sm px-3 py-1.5 rounded-full border border-green-500 text-green-400 hover:bg-gray-800 transition-colors"
            >
              <span className="mr-1 truncate max-w-[150px]">{userEmail}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform duration-200 ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 z-10 border border-gray-800">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={onSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    role="menuitem"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default FeedHeader;
