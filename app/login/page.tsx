'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        router.push('/bookings');
      }
    } catch (err: any) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Host Portal Login</h1>
          <p className="text-slate-400 text-sm">Sign in to manage your La Estancia properties</p>
        </div>

        {errorMsg && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3 rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
              placeholder="host@laestancia.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-950 hover:bg-red-900 border border-red-800 font-bold py-2.5 rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2">
          <Link href="/" className="hover:text-slate-300 transition">← Back to Home</Link>
        </div>
      </div>
    </main>
  );
}