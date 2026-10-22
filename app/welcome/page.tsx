import HeaderNav from '../components/HeaderNav';

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Desktop Navigation Header with all icons */}
      <HeaderNav />

      {/* Main Welcome Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold tracking-wide">
            ✨ PREMIUM SERVICED APARTMENTS & MANSIONS
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Luxury Staycation Homes Made Effortless.
          </h1>
          
          <p className="text-slate-400 text-lg">
            Experience hand-picked short-stay apartments and houses. Reserve directly via WhatsApp with zero extra booking fees.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href="/properties"
              className="bg-red-950 hover:bg-red-900 text-white font-bold py-3 px-8 rounded-xl border border-red-800 transition"
            >
              Explore Available Stays
            </a>
            <a
              href="/login"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl border border-slate-700 transition"
            >
              List Your Property With Us
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}