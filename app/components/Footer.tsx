import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-neutral-900 border-t border-neutral-800 mt-16 py-8 text-neutral-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white">La Estancia Vacation Homes</span>
          <span className="text-neutral-600">|</span>
          <span>Global Short-Stay & Co-Hosting Platform</span>
        </div>

        <div className="flex items-center gap-6 font-semibold">
          <Link href="/properties" className="hover:text-amber-500 transition">Properties</Link>
          <Link href="/blog" className="hover:text-amber-500 transition">Blog</Link>
          <Link href="/about" className="hover:text-amber-500 transition">About Us</Link>
        </div>

      </div>
    </footer>
  )
}