// components/common/EnhancedLoadingScreen.jsx

"use client";
import React, { useState, useEffect } from "react";

export default function EnhancedLoadingScreen() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(
    "Preparing your experience..."
  );

  useEffect(() => {
    const messages = [
      "Preparing your experience...",
      "Building a distraction-free environment...",
      "Creating your intentional space...",
      "Almost ready to help you focus...",
      "Setting up your curated feed...",
    ];

    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 400);

    // Change loading message periodically
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 1500);

    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <div className="w-full max-w-md px-8 py-12">
        <div className="text-4xl font-extrabold tracking-wide text-white mb-12 text-center">
          FocusFeed
        </div>

        {/* Animated illustration */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
          <div
            className="absolute inset-0 border-4 border-t-green-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"
            style={{ animationDuration: "1.5s" }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                fill="#22c55e"
              />
              <path
                d="M2 12.5C2 12.5 5.5 6 12 6C18.5 6 22 12.5 22 12.5C22 12.5 18.5 19 12 19C5.5 19 2 12.5 2 12.5Z"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-2.5 mb-4 overflow-hidden">
          <div
            className="bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>

        {/* Loading message */}
        <p className="text-white text-center text-lg font-medium">
          {loadingMessage}
        </p>

        {/* Subtle hint */}
        <p className="text-gray-500 text-center text-sm mt-8">
          Building a more intentional YouTube experience
        </p>
      </div>
    </div>
  );
}
