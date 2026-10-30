// Add a state for nightly rate inside the edit modal
  const [editNightlyRate, setEditNightlyRate] = useState<number>(100)

  const handleOpenEditModal = (booking: Booking) => {
    setEditingBooking(booking)
    setEditPrice((booking.total_price ?? booking.total_amount ?? 0).toString())
    setEditCheckIn(booking.check_in || '')
    setEditCheckOut(booking.check_out || '')
    setEditNotes(booking.notes || '')

    // Find the property's nightly rate if available
    const matchedProp = properties.find((p) => p.title === booking.property_title)
    if (matchedProp) {
      setEditNightlyRate(matchedProp.price_per_night || 100)
    } else {
      setEditNightlyRate(100)
    }
  }

  // Logical auto-calculation whenever dates change
  useEffect(() => {
    if (editCheckIn && editCheckOut && editNightlyRate > 0) {
      const start = new Date(editCheckIn)
      const end = new Date(editCheckOut)
      const diffTime = end.getTime() - start.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays > 0) {
        setEditPrice((diffDays * editNightlyRate).toString())
      }
    }
  }, [editCheckIn, editCheckOut, editNightlyRate])