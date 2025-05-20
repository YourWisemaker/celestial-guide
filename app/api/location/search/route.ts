import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 })
  }

  try {
    // Use OpenStreetMap's Nominatim service for geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
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

    if (data.length > 0) {
      const result = data[0]
      return NextResponse.json({
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name,
      })
    } else {
      // Fallback to New York if no results found
      return NextResponse.json({
        latitude: 40.7128,
        longitude: -74.006,
        displayName: "New York, NY, USA",
      })
    }
  } catch (error) {
    console.error("Error searching location:", error)
    return NextResponse.json({ error: "Failed to search location" }, { status: 500 })
  }
}
