import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Parameters 'lat' and 'lon' are required" }, { status: 400 })
  }

  try {
    // Convert to numbers
    const latitude = Number.parseFloat(lat)
    const longitude = Number.parseFloat(lon)

    // Use OpenStreetMap's Nominatim service for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      {
        headers: {
          "User-Agent": "CelestialGuideApp/1.0",
          "Accept-Language": "en-US,en"
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      latitude: latitude,
      longitude: longitude,
      displayName: data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    })
  } catch (error) {
    console.error("Error reverse geocoding:", error)
    return NextResponse.json({ error: "Failed to reverse geocode location" }, { status: 500 })
  }
}
