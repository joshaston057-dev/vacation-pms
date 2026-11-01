'use client'

import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'

const BLOG_POSTS = [
  {
    id: '1',
    category: 'Traveler Insights',
    title: '5 Key Things International Travelers Look for in a Modern Short-Stay',
    snippet: 'From fiber-optic internet and executive workspaces to automated check-in and power backup, discover what converts a listing into an international favorite.',
    date: 'Nov 2026',
    readTime: '4 min read',
  },
  {
    id: '2',
    category: 'Co-Hosting & Yield',
    title: 'How Professional Co-Hosting Maximizes ROI for Vacation Home Owners',
    snippet: 'Managing short-stay rentals remotely can be challenging. Learn how La Estancia’s co-hosting model handles dynamic pricing, listing maintenance, and 5-star guest reviews.',
    date: 'Oct 2026',
    readTime: '6 min read',
  },
  {
    id: '3',
    category: 'Executive Hospitality',
    title: 'Short-Stay vs Hotel: Why Business Travelers are Making the Switch',
    snippet: 'Privacy, modern kitchen amenities, and custom concierge services are reshaping how global corporate travelers select their accommodation.',
    date: 'Oct 2026',
    readTime: '5 min read',
  },
]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        {/* HERO SECTION */}
        <section className="bg-neutral-900 border-b border-neutral-800 py-16 px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-3">
            <span className="text-amber-500 font-extrabold text-xs uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Insights & Guides
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              La Estancia Hospitality Blog
            </h1>
            <p className="text-neutral-400 text-xs sm:text-base max-w-xl mx-auto">
              Travel tips, co-hosting strategies, and short-stay trends for global hosts and guests.
            </p>
          </div>
        </section>

        {/* BLOG ARTICLES LIST */}
        <section className="max-w-5xl mx-auto p-6 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between hover:border-neutral-700 transition shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                    <span>{post.category}</span>
                    <span className="text-neutral-500">{post.readTime}</span>
                  </div>
                  <h2 className="text-base font-bold text-white hover:text-amber-400 cursor-pointer leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {post.snippet}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800/80 mt-4 flex justify-between items-center text-xs text-neutral-500">
                  <span>{post.date}</span>
                  <button className="text-amber-500 font-bold hover:underline text-xs">
                    Read Article →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}