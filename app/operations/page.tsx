const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let uploadedUrls: string[] = []

      // 1. Upload Images to exact bucket: 'property-images'
      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < Math.min(imageFiles.length, 5); i++) {
          const file = imageFiles[i]
          const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('property-images') // EXACT LOWERCASE BUCKET NAME
            .upload(fileName, file, { upsert: true })

          if (uploadError) {
            console.error('Image Upload Error:', uploadError.message)
            alert('Warning: Image failed to upload - ' + uploadError.message)
          } else if (uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from('property-images')
              .getPublicUrl(fileName)

            if (publicUrlData?.publicUrl) {
              uploadedUrls.push(publicUrlData.publicUrl)
            }
          }
        }
      }

      // 2. Insert Listing Row into Supabase Table
      const { data: insertedData, error: insertError } = await supabase
        .from('properties')
        .insert([
          {
            title,
            location,
            price_per_night: parseFloat(pricePerNight) || 0,
            bedrooms: parseInt(bedrooms),
            bathrooms: parseInt(bathrooms),
            guests: parseInt(guests),
            property_type: propertyType,
            whatsapp_number: whatsappNumber,
            description,
            amenities: selectedAmenities,
            image_urls: uploadedUrls,
          },
        ])
        .select()

      if (insertError) {
        alert('Database Error: ' + insertError.message)
      } else {
        alert('Property published successfully!')
        setTitle('')
        setLocation('')
        setPricePerNight('')
        setDescription('')
        setSelectedAmenities([])
        setImageFiles(null)
        await fetchAllData() // Instantly refresh active portfolio list
      }
    } catch (err: any) {
      alert('Unexpected Error: ' + (err.message || err))
    } finally {
      setSubmitting(false)
    }
  }