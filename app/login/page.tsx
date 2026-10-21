'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push('/reports');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-amber-400">La Estancia Vacation Homes</h1>
          <p className="text-sm text-slate-400 mt-1">Property Host & Co-Hosting Portal</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-300 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
              placeholder="owner@example.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-4 rounded transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>
      </div>
    </div>
  );
}