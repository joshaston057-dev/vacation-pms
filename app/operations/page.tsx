{activeTab === 'bookings' && (
            <div className="space-y-8">
              {/* Manual Add Reservation Form */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Add Manual Reservation</h2>
                <form onSubmit={handleAddBooking} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <select value={bPropertyId} onChange={(e) => handleSelectPropertyForBooking(e.target.value)} required className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs">
                    <option value="">Select Property</option>
                    {properties.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
                  </select>
                  <input type="text" required placeholder="Guest Name" value={bGuestName} onChange={(e) => setBGuestName(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs" />
                  <input type="text" required placeholder="Guest Contact" value={bGuestPhone} onChange={(e) => setBGuestPhone(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs" />
                  <input type="date" required value={bCheckIn} onChange={(e) => setBCheckIn(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs" />
                  <input type="date" required value={bCheckOut} onChange={(e) => setBCheckOut(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs" />
                  <input type="number" required placeholder="Total Amount ($)" value={bTotalPrice} onChange={(e) => setBTotalPrice(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs" />
                  <button type="submit" className="sm:col-span-3 py-3 bg-amber-500 text-black font-extrabold text-xs rounded-xl">Save Reservation</button>
                </form>
              </div>

              {/* LIVE INCOMING GUEST BOOKINGS & INQUIRIES LIST */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Incoming Guest Reservations & Inquiries</h2>
                
                {bookings.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">No bookings or inquiries received yet.</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[10px] px-2 py-0.5 rounded-md">
                              {booking.status || 'Pending Host Review'}
                            </span>
                            <h3 className="font-bold text-white text-sm">{booking.property_title}</h3>
                          </div>
                          <p className="text-xs text-neutral-300">
                            👤 <strong className="text-white">{booking.guest_name}</strong> ({booking.guest_phone})
                          </p>
                          <p className="text-xs text-neutral-400">
                            📅 Check-In: <span className="text-white">{booking.check_in}</span> → Check-Out: <span className="text-white">{booking.check_out}</span>
                          </p>
                          {booking.notes && (
                            <p className="text-[11px] text-neutral-400 bg-neutral-900 p-2 rounded-lg border border-neutral-800">
                              💬 {booking.notes}
                            </p>
                          )}
                        </div>

                        <div className="text-right flex sm:flex-col justify-between w-full sm:w-auto items-center sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800">
                          <span className="text-amber-500 font-extrabold text-base">${booking.total_price}</span>
                          <span className="text-[10px] text-neutral-500">Logged automatically</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}