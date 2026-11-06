<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
  {bookings.map((b) => {
    const isConfirmed = b.status === 'CONFIRMED'

    return (
      <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-2xl flex flex-col justify-between">
        
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-2">
            <h4 className="font-black text-white text-sm tracking-tight capitalize">
              {b.property_title || 'The requested property'}
            </h4>
            <span className={`text-[10px] font-black px-3 py-1 rounded-full border shrink-0 ${
              isConfirmed
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {isConfirmed ? 'Confirmed Stay' : 'Pending Host Review'}
            </span>
          </div>

          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-neutral-300">
              <span className="text-neutral-400">👤</span>
              <span className="text-neutral-400">Guest Name:</span>
              <span className="font-extrabold text-white">{b.guest_name || 'Hossy'}</span>
            </div>

            <div className="flex items-center gap-2 text-neutral-300">
              <span className="text-neutral-400">💬</span>
              <span className="text-neutral-400">WhatsApp Contact:</span>
              <span className={`font-extrabold ${b.phone ? 'text-emerald-400' : 'text-neutral-500 italic'}`}>
                {b.phone || 'Not provided'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-neutral-300">
              <span className="text-neutral-400">📅</span>
              <span className="text-neutral-400">Dates:</span>
              <span className="font-extrabold text-white">
                {b.check_in || '2026-11-12'} → {b.check_out || '2026-12-14'}
              </span>
            </div>
          </div>

          <div className="bg-neutral-950/60 p-3.5 rounded-2xl border border-neutral-800 space-y-1">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
              📝 Guest Notes:
            </span>
            <p className="text-xs text-neutral-300 font-medium leading-relaxed">
              {b.guest_notes || 'No special requests provided by guest.'}
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          {b.phone ? (
            <a
              href={`https://api.whatsapp.com/send?phone=${b.phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Hello ${b.guest_name}, regarding your stay inquiry:`)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow transition flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <span>💬</span> Message Guest on WhatsApp
            </a>
          ) : (
            <button
              disabled
              className="w-full py-3 bg-neutral-800 text-neutral-500 font-bold text-xs rounded-2xl cursor-not-allowed text-center"
            >
              💬 WhatsApp Contact: Not Provided
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            {!isConfirmed && (
              <button
                onClick={() => handleApproveBooking(b.id)}
                className="py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-black text-xs rounded-2xl shadow transition cursor-pointer text-center"
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