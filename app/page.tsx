'use client'

import HeaderNav from './components/HeaderNav'
import Footer from './components/Footer'
import UpsellMotionSlider from './components/UpsellMotionSlider'

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between">
      <div>
        <HeaderNav />

        {/* HERO TITLE */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-4 text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Exclusive Short-Stay Properties in Uganda
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto">
            Apartments, standalone houses, mansions, and villas with premium guest concierge services.
          </p>
        </section>

        {/* 🚀 UPSELL MOTION SLIDER BANNER GOES HERE */}
        <UpsellMotionSlider />

      </div>
      <Footer />
    </main>
  )
}