// components/common/FeedHeader.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import SettingsDropdown from "./SettingsDropdown";

export default function FeedHeader({ title, showSettingsIcon = true }) {
  const [user, setUser] = useState(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function getUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    }
    getUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/feed" className="text-xl font-bold text-white">
            FocusFeed
          </Link>
          {title && (
            <>
              <span className="mx-2 text-gray-500">/</span>
              <h1 className="text-lg font-medium text-gray-300">{title}</h1>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {showSettingsIcon && <SettingsDropdown />}

          {user && (
            <>
              <span className="text-sm text-gray-300">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
