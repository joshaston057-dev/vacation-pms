// Inside Daily Operations tab - Guest / Housekeeper Direct WhatsApp Action
<div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between mt-4">
  <div>
    <p className="text-xs text-neutral-400">Quick Guest Dispatch</p>
    <p className="text-sm font-semibold text-white">{selectedProp || 'Selected Property'}</p>
  </div>
  <a
    href={`https://wa.me/256757386946?text=Hi!%20This%20is%20La%20Estancia%20Vacation%20Homes.%20Here%20are%20your%20check-in%20and%20access%20details%20for%20${encodeURIComponent(
      selectedProp || 'your stay'
    )}.`}
    target="_blank"
    rel="noopener noreferrer"
    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-2"
  >
    💬 Send WhatsApp Check-in
  </a>
</div>