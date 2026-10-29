const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let uploadedUrls: string[] = []

      // 1. Upload Images to 'property-images' bucket
      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < Math.min(imageFiles.length, 5); i++) {
          const file = imageFiles[i]
          const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(fileName, file, { upsert: true })

          if (uploadError) {
            console.error('Image upload failed:', uploadError.message)
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

      // 2. Direct insert without trailing .select() to prevent RLS return blocking
      const { error: insertError } = await supabase
        .from('properties')
        .insert([
          {
            title: title,
            location: location,
            price_per_night: parseFloat(pricePerNight) || 0,
            bedrooms: parseInt(bedrooms),
            bathrooms: parseInt(bathrooms),
            guests: parseInt(guests),
            property_type: propertyType,
            whatsapp_number: whatsappNumber,
            description: description,
            amenities: selectedAmenities,
            image_urls: uploadedUrls,
          },
        ])

      if (insertError) {
        alert('Database Error: ' + insertError.message)
      } else {
        alert('Property published successfully!')
        // Reset form inputs
        setTitle('')
        setLocation('')
        setPricePerNight('')
        setDescription('')
        setSelectedAmenities([])
        setImageFiles(null)
        
        // Refresh properties list
        await fetchAllData()
      }
    } catch (err: any) {
      alert('Error saving property: ' + (err?.message || 'Please check your connection.'))
    } finally {
      setSubmitting(false)
    }
  }