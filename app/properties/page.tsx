{/* INTERNAL BOOKING REQUEST BUTTON / ACTION */}
<button
  onClick={() => {
    const guestName = prompt("Enter your full name for this booking inquiry:")
    if (!guestName) return
    const checkIn = prompt("Enter check-in date (YYYY-MM-DD):", "2026-11-01")
    if (!checkIn) return
    const checkOut = prompt("Enter check-out date (YYYY-MM-DD):", "2026-11-05")
    if (!checkOut) return

    // Insert booking straight into Supabase database
    supabase.from('bookings').insert([
      {
        guest_name: guestName,
        property_name: property.title,
        check_in: checkIn,
        check_out: checkOut,
        total_price: property.price_per_night * 3, // example calculation or form input
        status: 'Pending'
      }
    ]).then(({ error }) => {
      if (error) alert('Error submitting booking: ' + error.message)
      else alert('Booking request submitted successfully to Host Operations!')
    })
  }}
  className="block w-full text-center py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition shadow cursor-pointer"
>
  📅 Request Reservation
</button>