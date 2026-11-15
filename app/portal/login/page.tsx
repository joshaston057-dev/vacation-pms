"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function PortalAuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const router = useRouter();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (isSignUp) {
      // --- SIGN UP FLOW ---
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/portal`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (!data.session) {
        // Triggered when Supabase requires email confirmation
        setSuccessMsg(
          "Account created successfully! Please check your email inbox to confirm your address before logging in."
        );
      } else {
        // If email confirmation is disabled in Supabase, log them straight in
        router.push("/portal");
      }
    } else {
      // --- SIGN IN FLOW ---
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        router.push("/portal");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 font-black flex items-center justify-center text-sm mx-auto shadow-lg shadow-amber-500/20">
            LE
          </div>
          <h1 className="text-xl font-bold text-white pt-2">
            {isSignUp ? "Create Host Account" : "Host Portal Login"}
          </h1>
          <p className="text-xs text-neutral-400">
            {isSignUp ? "Register to manage your properties & bookings" : "Sign in to access your property management dashboard"}
          </p>
        </div>

        {/* Success or Error Banners */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl p-4 leading-relaxed">
            ✓ {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl p-3">
            ⚠ {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="host@laestancia.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          {!isSignUp && (
            <div className="text-right">
              <a
                href="/portal/forgot-password"
                className="text-[11px] text-amber-400 hover:underline"
              >
                Forgot password?
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 rounded-xl text-xs transition cursor-pointer disabled:opacity-50 shadow-lg shadow-amber-500/10"
          >
            {loading ? "Processing..." : isSignUp ? "Create Account & Verify" : "Sign In to Portal"}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="border-t border-neutral-800 pt-4 text-center text-xs text-neutral-400">
          {isSignUp ? (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-amber-400 font-semibold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              New host or client?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-amber-400 font-semibold hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}