<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
  {bookings.map((b) => {
    const totalStay = b.total_price || 150
    const depositDue = Math.round(totalStay * 0.3)
    const isConfirmed = b.status === 'CONFIRMED'
    const guestName = cleanGuestName(b.guest_name)
    const phoneNum = cleanPhone(b)
    
    // Correct date mapping from Supabase check_in / check_out columns
    const checkInDate = b.check_in || b.checkIn || 'N/A'
    const checkOutDate = b.check_out || b.checkOut || 'N/A'
    const specialNotes = b.guest_notes || b.notes || 'No special requests'

    const paymentWhatsAppText = encodeURIComponent(
      `Hello ${guestName}! 👋 Thank you for your inquiry for *${b.property_title || 'La Estancia Vacation Home'}*.\n\n` +
      `📅 *Stay Dates:* ${checkInDate} → ${checkOutDate}\n` +
      `💰 *Total Stay:* $${totalStay}\n` +
      `🔐 *30% Deposit Required:* $${depositDue}\n\n` +
      `Please complete your 30% deposit payment via Mobile Money (MoMo) or Card to secure your reservation. Once sent, kindly reply with your payment confirmation code here!`
    )

    return (
      <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-2xl flex flex-col justify-between">
        
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-3">
            <h4 className="font-black text-white text-sm leading-snug">
              {b.property_title || 'Vacation Stay'}
            </h4>
            <span className={`text-[10px] font-black px-3 py-1 rounded-full border shrink-0 ${
              isConfirmed
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {b.status || 'PENDING'}
            </span>
          </div>

          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3 text-xs">
            <div className="flex items-center gap-2.5 text-neutral-300">
              <span className="text-neutral-400 text-sm">👤</span>
              <span className="text-neutral-400">Guest Name:</span>
              <span className="font-extrabold text-white">{guestName}</span>
            </div>

            <div className="flex items-center gap-2.5 text-neutral-300">
              <span className="text-neutral-400 text-sm">💬</span>
              <span className="text-neutral-400">WhatsApp:</span>
              <span className="font-extrabold text-emerald-400">{phoneNum}</span>
            </div>

            <div className="flex items-center gap-2.5 text-neutral-300">
              <span className="text-neutral-400 text-sm">👥</span>
              <span className="text-neutral-400">Demographic:</span>
              <span className="font-extrabold text-amber-400">{b.purpose || 'Leisure'}</span>
            </div>

            <div className="flex items-center gap-2.5 text-neutral-300">
              <span className="text-neutral-400 text-sm">👥</span>
              <span className="text-neutral-400">Guests:</span>
              <span className="font-extrabold text-white">{(b.adults || 1) + (b.children || 0)}</span>
            </div>

            <div className="flex items-center gap-2.5 text-neutral-300">
              <span className="text-neutral-400 text-sm">📅</span>
              <span className="text-neutral-400">Dates:</span>
              <span className="font-extrabold text-white">{checkInDate} → {checkOutDate}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-lg">
                <span className="text-[10px] text-neutral-400 block">Total Stay:</span>
                <span className="text-amber-400 font-black text-sm">${totalStay}</span>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-lg">
                <span className="text-[10px] text-neutral-400 block">30% Deposit Due:</span>
                <span className="text-emerald-400 font-black text-sm">${depositDue}</span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-1">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
              📝 GUEST NOTES:
            </span>
            <p className="text-xs text-neutral-300 font-medium leading-relaxed">
              {specialNotes}
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {!isConfirmed && (
            <button
              onClick={() => handleApproveBooking(b.id)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow cursor-pointer transition text-center"
            >
              ⚡ Approve Cash / MoMo
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://api.whatsapp.com/send?phone=${phoneNum.replace(/[^0-9]/g, '')}&text=${paymentWhatsAppText}`}
              target="_blank"
              rel="noreferrer"
              className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 text-center cursor-pointer"
            >
              <span>💬</span> WhatsApp Payment
            </a>
            
            <button
              onClick={() => handleDeleteBooking(b.id)}
              className="py-3 bg-rose-950 hover:bg-rose-900 border border-rose-900 text-rose-400 font-black text-xs rounded-xl shadow transition cursor-pointer text-center"
            >
              🗑️ Delete
            </button>
          </div>
        </div>

      </div>
    )
  })}
</div>