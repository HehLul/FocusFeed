// components/SignupModal.jsx
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabase';

export default function SignupModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) throw signUpError;
      
      // Check for session - if no session, manually sign in
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.log("No session after signup, attempting manual sign in");
        
        // Explicit sign in after signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) throw signInError;
        
        // Verify we have a session now
        const { data: verifySession } = await supabase.auth.getSession();
        console.log("Session after manual sign in:", verifySession.session ? "Active" : "None");
      } else {
        console.log("Session created successfully during signup");
      }
      
      // At this point we should have a valid session
      // Call onSuccess to continue with feed creation
      onSuccess(data.user);
      
      // Show the redirecting state
      setIsRedirecting(true);
      
    } catch (error) {
      console.error("Authentication error:", error);
      setError(error.message);
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-lg max-w-md w-full">
        {isRedirecting ? (
          <div className="text-center">
            <p className="text-gray-300 mt-4">Taking you to your feed...</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6">Create Your Account</h2>
            
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSignup}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 text-white p-3 rounded"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 text-white p-3 rounded"
                  required
                  minLength={6}
                />
                <p className="text-gray-400 text-sm mt-1">Must be at least 6 characters</p>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-white text-black py-3 rounded font-semibold"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
              
              <div className="mt-4 text-center">
                <button 
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}