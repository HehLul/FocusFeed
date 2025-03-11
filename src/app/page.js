"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const router = useRouter();

  const handleCtaClick = () => {
    router.push("/setup");
  };

  const features = [
    {
      title: "Take Back Control",
      description:
        "Eliminate algorithmic distractions and build a feed that serves you, not advertisers.",
    },
    {
      title: "Watch With Purpose",
      description:
        "Curate a YouTube experience aligned with your goals—whether learning, relaxation, or growth.",
    },
    {
      title: "Reclaim Your Life",
      description:
        "Escape the endless loop of mindless scrolling. FocusFeed puts *you* in control.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <div className="text-3xl font-extrabold tracking-wide">FocusFeed</div>
          <button
            className="text-white border border-white px-6 py-2 rounded-md hover:bg-white hover:text-black transition"
            onClick={handleCtaClick}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Updated Hero Section with Two-Column Layout */}
      <header className="px-6 pt-32 pb-16">
        <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Text Content */}
          <div className="text-left">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Break Free from Algorithmic Addiction
            </h1>
            <p className="text-xl text-gray-300 mt-6">
              Every second wasted on mindless scrolling is a second stolen from
              your potential. Build a feed that fuels your future.
            </p>
            <button
              className="mt-8 bg-green-500 text-black px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition"
              onClick={handleCtaClick}
            >
              Start Your Free Trial
            </button>
          </div>

          {/* Right Column - Illustration */}
          <div className="flex justify-around md:justify-end">
            <div className="relative w-full max-w-md h-80 md:h-96">
              <Image
                src="/illustration.jpg"
                alt="Person trapped in digital addiction"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </header>

      <section className="bg-gray-900 p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">The Cost of Inaction</h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          An average person spends 3.5 hours daily on YouTube & social media.
          That's{" "}
          <span className="text-green-500 font-bold">1,277 hours a year</span>
          —more than 50 full days.
        </p>
        <div className="grid md:grid-cols-2 gap-8 mt-6 max-w-4xl mx-auto">
          <div className="p-6 bg-gray-800 rounded-lg">
            <h3 className="text-4xl font-bold text-green-500">1,277</h3>
            <p className="text-gray-300">Hours Wasted Annually</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg">
            <h3 className="text-4xl font-bold text-green-500">$38,310</h3>
            <p className="text-gray-300">Potential Productivity Gain</p>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 text-center">
        <h2 className="text-4xl font-bold mb-12">Why FocusFeed?</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center py-16 bg-gray-900">
        <h2 className="text-4xl font-bold mb-6">
          One Decision Can Change Everything
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          Will you take control of your digital habits today, or continue
          letting algorithms dictate your attention?
        </p>
        <button
          className="bg-green-500 text-black px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition"
          onClick={handleCtaClick}
        >
          Get Started Now
        </button>
      </section>

      <footer className="bg-gray-900 py-8 text-center">
        <p className="text-gray-400">© 2024 FocusFeed. All rights reserved.</p>
        <div className="mt-4 space-x-4">
          <Link href="/privacy" className="text-gray-400 hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-gray-400 hover:text-white">
            Terms of Service
          </Link>
          <Link href="/contact" className="text-gray-400 hover:text-white">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}
