
"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const features = [
    {
      title: 'Curate Your Feed',
      description: 'Select only the content creators that matter to you, eliminating digital noise.'
    },
    {
      title: 'Purposeful Consumption',
      description: 'Create themed feeds for learning, relaxation, and personal growth.'
    },
    {
      title: 'Reclaim Your Time',
      description: 'Stop endless scrolling and take control of your media diet.'
    }
  ];

  const reviews = [
    {
      name: 'Michael T.',
      text: 'FocusFeed helped me reduce my daily screen time by 3 hours. That\'s nearly 1,000 hours a year I can now invest in myself!',
      rating: 5
    },
    {
      name: 'Emily R.',
      text: 'I used to waste hours mindlessly scrolling. Now, I have a purposeful feed that actually helps me grow and learn.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center p-4">
          <div className="text-2xl font-bold">FocusFeed</div>
          <div className="space-x-4">
            <button 
              className="text-white bg-transparent border border-white px-4 py-2 rounded"
              onClick={() => setIsSignupOpen(true)}
            >
              Log in
            </button>
            <button 
              className="text-black bg-white px-4 py-2 rounded"
              onClick={() => setIsSignupOpen(true)}
            >
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-24 text-center">
        <h1 className="text-6xl font-bold mb-6">
          Take Control of Your YouTube Consumption
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Curate a YouTube feed that aligns with your goals. Stop mindless scrolling and start intentional watching.
        </p>
        
        <div className="space-x-4">
          <button 
            className="bg-white text-black px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-200 transition"
            onClick={() => setIsSignupOpen(true)}
          >
            Start Curating Your Feed
          </button>
        </div>

        {/* Time Savings Calculator */}
        <div className="mt-16 bg-gray-900 p-8 rounded-lg max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Imagine Saving 1,000+ Hours Annually</h2>
          <p className="text-gray-300 mb-4">
            The average person spends 3.5 hours daily on social media and YouTube.
            FocusFeed helps you reclaim that time:
          </p>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-5xl font-bold text-green-500">1,277</p>
              <p className="text-gray-300">Hours Saved Annually</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-green-500">$38,310</p>
              <p className="text-gray-300">Potential Productivity Gain</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-gray-900 p-6 rounded-lg text-center"
            >
              <h3 className="text-2xl font-semibold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold mb-12">What Our Users Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {reviews.map((review, index) => (
            <div 
              key={index} 
              className="bg-gray-900 p-6 rounded-lg"
            >
              <p className="text-xl italic mb-4">
                "{review.text}"
              </p>
              <div className="flex justify-center items-center">
                <div className="text-yellow-500 mr-2">{'★'.repeat(review.rating)}</div>
                <p className="font-semibold">{review.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">
          How FocusFeed Differs
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">Traditional YouTube</h3>
            <ul className="text-gray-300 space-y-2">
              <li>✖ Endless Recommended Videos</li>
              <li>✖ Algorithmic Distractions</li>
              <li>✖ No Content Control</li>
            </ul>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border-2 border-green-500">
            <h3 className="text-2xl font-semibold mb-4">FocusFeed</h3>
            <ul className="text-gray-300 space-y-2">
              <li>✓ Curated Content Feeds</li>
              <li>✓ Purposeful Watching</li>
              <li>✓ Complete Control</li>
            </ul>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">Other Blockers</h3>
            <ul className="text-gray-300 space-y-2">
              <li>✖ Easy to Bypass</li>
              <li>✖ Relies on Willpower</li>
              <li>✖ Temporary Solutions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Transform Your Media Consumption?
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Join thousands of users who have taken control of their digital diet.
        </p>
        <button 
          className="bg-white text-black px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-200 transition"
          onClick={() => setIsSignupOpen(true)}
        >
          Start Your Free Trial
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 FocusFeed. All rights reserved.
          </p>
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
        </div>
      </footer>
    </div>
  );
}