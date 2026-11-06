<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {bookings.map((b) => {
    const totalStay = b.total_price || 150
    const depositDue = Math.round(totalStay * 0.3)
    const isConfirmed = b.status === 'CONFIRMED'

    return (
      <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-2xl flex flex-col justify-between">
        
        {/* HEADER */}
        <div className="space-y-2 border-b border-neutral-800 pb-4">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-black text-white text-sm uppercase tracking-wide">
              {b.property_title || 'Vacation Stay'}
            </h4>
            <span className={`text-[10px] font-black px-3 py-1 rounded-full border shrink-0 ${
              isConfirmed
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {isConfirmed ? 'Confirmed Stay' : 'Pending Host Review'}
            </span>
          </div>
        </div>

        {/* DETAILS LIST */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between bg-neutral-950 px-3.5 py-2.5 rounded-xl border border-neutral-800/60">
            <span className="text-neutral-400 font-bold">Guest Name</span>
            <span className="font-extrabold text-white">{b.guest_name || 'Not provided'}</span>
          </div>

          <div className="flex items-center justify-between bg-neutral-950 px-3.5 py-2.5 rounded-xl border border-neutral-800/60">
            <span className="text-neutral-400 font-bold">WhatsApp Phone</span>
            <span className="font-extrabold text-emerald-400">{b.phone || 'Not provided'}</span>
          </div>

          <div className="flex items-center justify-between bg-neutral-950 px-3.5 py-2.5 rounded-xl border border-neutral-800/60">
            <span className="text-neutral-400 font-bold">Demographic</span>
            <span className="font-extrabold text-amber-400">{b.purpose || 'Solo Business'}</span>
          </div>

          <div className="flex items-center justify-between bg-neutral-950 px-3.5 py-2.5 rounded-xl border border-neutral-800/60">
            <span className="text-neutral-400 font-bold">Guests</span>
            <span className="font-extrabold text-white">{(b.adults || 1) + (b.children || 0)} Guests</span>
          </div>

          <div className="flex items-center justify-between bg-neutral-950 px-3.5 py-2.5 rounded-xl border border-neutral-800/60">
            <span className="text-neutral-400 font-bold">Stay Dates</span>
            <span className="font-extrabold text-white">{b.check_in} → {b.check_out}</span>
          </div>
        </div>

        {/* FINANCIAL SUMMARY */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-neutral-400 block uppercase">Total Stay</span>
            <span className="text-sm font-black text-amber-400">${totalStay}</span>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-neutral-400 block uppercase">30% Deposit</span>
            <span className="text-sm font-black text-emerald-400">${depositDue}</span>
          </div>
        </div>

        {/* NOTES */}
        <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-1">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
            📝 Guest Notes:
          </span>
          <p className="text-xs text-neutral-300 font-medium leading-relaxed">
            {b.guest_notes || 'No special requests'}
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-2 pt-1">
          {b.phone && (
            <a
              href={`https://api.whatsapp.com/send?phone=${b.phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Hello ${b.guest_name}, regarding your stay inquiry:`)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow transition flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <span>💬</span> Chat on WhatsApp
            </a>
          )}

          <div className="grid grid-cols-2 gap-2">
            {!isConfirmed && (
              <button
                onClick={() => handleApproveBooking(b.id)}
                className="py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-2xl shadow transition cursor-pointer text-center"
              >
                ✓ Approve Stay
              </button>
            )}
            <button
              onClick={() => handleDeleteBooking(b.id)}
              className={`${isConfirmed ? 'col-span-2' : ''} py-3 bg-rose-950/80 hover:bg-rose-900 border border-rose-900/50 text-rose-400 font-black text-xs rounded-2xl shadow transition cursor-pointer text-center`}
            >
              🗑️ Delete
            </button>
          </div>
        </div>

      </div>
    )
  })}
</div>