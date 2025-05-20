"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"

interface SkyMapProps {
  date: Date
  time: string
  latitude: number
  longitude: number
}

// Helper functions for astronomical calculations
function degreesToRadians(degrees: number): number {
  return degrees * Math.PI / 180
}

function radiansToDegrees(radians: number): number {
  return radians * 180 / Math.PI
}

// Calculate star position based on sidereal time
function calculateStarPosition(ra: number, dec: number, lst: number, lat: number): { x: number, y: number, visible: boolean } {
  // Convert to radians
  const raRad = degreesToRadians(ra * 15) // Convert hours to degrees, then to radians
  const decRad = degreesToRadians(dec)
  const latRad = degreesToRadians(lat)
  const lstRad = degreesToRadians(lst * 15) // Convert hours to degrees, then to radians

  // Calculate hour angle
  const haRad = lstRad - raRad

  // Calculate altitude and azimuth
  const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad)
  const alt = Math.asin(sinAlt)
  
  // If altitude is negative, star is below horizon
  if (alt < 0) {
    return { x: 0, y: 0, visible: false }
  }
  
  const cosAz = (Math.sin(decRad) - Math.sin(latRad) * Math.sin(alt)) / (Math.cos(latRad) * Math.cos(alt))
  let az = Math.acos(Math.max(-1, Math.min(1, cosAz)))
  
  // Adjust azimuth based on hour angle
  if (Math.sin(haRad) > 0) {
    az = 2 * Math.PI - az
  }
  
  // Convert altitude and azimuth to x,y coordinates (stereographic projection)
  const r = (Math.PI / 2 - alt) / (Math.PI / 2) * 0.95 // Scale factor for projection
  const x = r * Math.sin(az)
  const y = r * Math.cos(az)
  
  return { x, y, visible: true }
}

// Calculate local sidereal time
function calculateLST(date: Date, time: string, longitude: number): number {
  // Parse the time
  const [hours, minutes] = time.split(':').map(Number)
  
  // Convert to UTC
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // JavaScript months are 0-based
  const day = date.getDate()
  
  // Calculate Julian date
  let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) +
           Math.floor(275 * month / 9) + day + 1721013.5
  
  // Add time component
  jd += (hours + minutes / 60) / 24
  
  // Calculate Greenwich sidereal time
  const t = (jd - 2451545.0) / 36525
  let gst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t * t - t * t * t / 38710000
  gst = (gst % 360) / 15 // Convert to hours and normalize
  
  // Calculate local sidereal time
  let lst = gst + longitude / 15
  lst = lst % 24 // Normalize to 0-24 hours
  if (lst < 0) lst += 24
  
  return lst
}

// Define some basic star data (bright stars)
const brightStars = [
  { name: "Sirius", ra: 6.75, dec: -16.7, magnitude: -1.46 },
  { name: "Canopus", ra: 6.4, dec: -52.7, magnitude: -0.74 },
  { name: "Alpha Centauri", ra: 14.66, dec: -60.83, magnitude: -0.27 },
  { name: "Arcturus", ra: 14.26, dec: 19.18, magnitude: -0.05 },
  { name: "Vega", ra: 18.62, dec: 38.78, magnitude: 0.03 },
  { name: "Capella", ra: 5.28, dec: 46.0, magnitude: 0.08 },
  { name: "Rigel", ra: 5.24, dec: -8.2, magnitude: 0.13 },
  { name: "Procyon", ra: 7.65, dec: 5.21, magnitude: 0.4 },
  { name: "Betelgeuse", ra: 5.92, dec: 7.41, magnitude: 0.45 },
  { name: "Achernar", ra: 1.63, dec: -57.24, magnitude: 0.45 },
  { name: "Hadar", ra: 14.06, dec: -60.37, magnitude: 0.61 },
  { name: "Altair", ra: 19.85, dec: 8.87, magnitude: 0.76 },
  { name: "Aldebaran", ra: 4.6, dec: 16.51, magnitude: 0.87 },
  { name: "Antares", ra: 16.49, dec: -26.43, magnitude: 1.09 },
  { name: "Spica", ra: 13.42, dec: -11.16, magnitude: 1.04 },
  { name: "Pollux", ra: 7.76, dec: 28.03, magnitude: 1.16 },
  { name: "Fomalhaut", ra: 22.96, dec: -29.62, magnitude: 1.17 },
  { name: "Deneb", ra: 20.69, dec: 45.28, magnitude: 1.25 },
  { name: "Regulus", ra: 10.14, dec: 11.97, magnitude: 1.36 },
  { name: "Adhara", ra: 6.98, dec: -28.97, magnitude: 1.5 },
]

// Planet positions (simplified approximation)
const getPlanetPositions = (date: Date): { name: string; ra: number; dec: number; color: string; size: number }[] => {
  // This is a very simplified approximation based on the date
  // In a real app, we'd use proper astronomical calculations or an ephemeris library
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
  
  return [
    {
      name: "Mercury",
      ra: (dayOfYear / 10 + 2) % 24,
      dec: Math.sin(dayOfYear / 30) * 20,
      color: "#cccccc",
      size: 4
    },
    {
      name: "Venus",
      ra: (dayOfYear / 20 + 5) % 24,
      dec: Math.sin(dayOfYear / 40) * 15,
      color: "#f9d849",
      size: 6
    },
    {
      name: "Mars",
      ra: (dayOfYear / 40 + 10) % 24,
      dec: Math.sin(dayOfYear / 60) * 25,
      color: "#dd361c",
      size: 5
    },
    {
      name: "Jupiter",
      ra: (dayOfYear / 80 + 15) % 24,
      dec: Math.sin(dayOfYear / 90) * 10,
      color: "#e6a64d",
      size: 10
    },
    {
      name: "Saturn",
      ra: (dayOfYear / 100 + 20) % 24,
      dec: Math.sin(dayOfYear / 120) * 15,
      color: "#b8a355",
      size: 9
    }
  ]
}

// Moon phase calculation
const getMoonPhase = (date: Date): number => {
  // Simplified moon phase calculation
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // Calculate approximate moon phase using simplified algorithm
  // 0 = new moon, 0.25 = first quarter, 0.5 = full moon, 0.75 = last quarter
  const c = 365.25 * year
  const e = 30.6 * month
  const jd = c + e + day - 694039.09
  const jd2 = jd / 29.53
  return (jd2 - Math.floor(jd2))
}

export default function SkyMap({ date, time, latitude, longitude }: SkyMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calculate LST once to avoid recalculation
  const lst = useMemo(() => {
    return calculateLST(date, time, longitude)
  }, [date, time, longitude])

  // Get planet positions
  const planets = useMemo(() => {
    return getPlanetPositions(date)
  }, [date])

  // Get moon phase
  const moonPhase = useMemo(() => {
    return getMoonPhase(date)
  }, [date])

  useEffect(() => {
    // Render the sky map with astronomical calculations
    const renderSkyMap = () => {
      setIsLoading(true)

      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Set canvas dimensions
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      // Create a gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "#020a18") // Deep space blue at top
      gradient.addColorStop(1, "#000510") // Almost black at bottom

      // Fill background
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Center point of the canvas
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(centerX, centerY) * 0.9 // 90% of the smallest dimension

      // Draw random background stars
      // Use the date, time, latitude, and longitude to seed the random generator
      const dateTimeString = `${date.toISOString()}-${time}-${latitude}-${longitude}`
      let seed = 0
      for (let i = 0; i < dateTimeString.length; i++) {
        seed += dateTimeString.charCodeAt(i)
      }

      const randomWithSeed = () => {
        const x = Math.sin(seed++) * 10000
        return x - Math.floor(x)
      }

      // Draw small stars (many)
      for (let i = 0; i < 500; i++) {
        const x = randomWithSeed() * canvas.width
        const y = randomWithSeed() * canvas.height
        const radius = randomWithSeed() * 1 + 0.2
        const opacity = randomWithSeed() * 0.8 + 0.2

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.fill()
      }

      // Draw named stars with accurate positions
      brightStars.forEach(star => {
        // Calculate star position based on time and location
        const position = calculateStarPosition(star.ra, star.dec, lst, latitude)
        
        if (position.visible) {
          // Convert normalized coordinates to canvas coordinates
          const x = centerX + position.x * radius
          const y = centerY + position.y * radius
          
          // Size based on magnitude (brighter = larger)
          const starRadius = 2.5 - star.magnitude * 0.3
          const opacity = 0.8 + Math.min(-star.magnitude, 0) * 0.1
          
          // Draw star with glow based on brightness
          // Star core
          ctx.beginPath()
          ctx.arc(x, y, starRadius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
          ctx.fill()
          
          // Glow effect for brighter stars
          if (star.magnitude < 0.5) {
            const glow = ctx.createRadialGradient(x, y, 0, x, y, starRadius * 4)
            glow.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.4})`)
            glow.addColorStop(1, "rgba(255, 255, 255, 0)")
            
            ctx.beginPath()
            ctx.arc(x, y, starRadius * 4, 0, Math.PI * 2)
            ctx.fillStyle = glow
            ctx.fill()
          }
          
          // Label only the brightest stars
          if (star.magnitude < 0.5) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
            ctx.font = "bold 12px serif"
            ctx.fillText(star.name, x + starRadius + 2, y + starRadius)
          }
        }
      })
      
      // Draw constellations
      const constellationData = {
        "Big Dipper": [
          { ra: 11.03, dec: 56.38 }, // Dubhe
          { ra: 11.03, dec: 61.75 }, // Merak
          { ra: 11.90, dec: 53.70 }, // Phecda
          { ra: 12.26, dec: 57.03 }, // Megrez
          { ra: 12.90, dec: 55.96 }, // Alioth
          { ra: 13.40, dec: 54.93 }, // Mizar
          { ra: 13.79, dec: 49.31 }, // Alkaid
        ],
        "Orion": [
          { ra: 5.92, dec: 7.41 },  // Betelgeuse (already in brightStars)
          { ra: 5.24, dec: -8.20 }, // Rigel (already in brightStars)
          { ra: 5.60, dec: -1.94 }, // Bellatrix
          { ra: 5.68, dec: -1.20 }, // Mintaka
          { ra: 5.54, dec: -0.30 }, // Alnilam
          { ra: 5.53, dec: -0.02 }, // Alnitak
          { ra: 5.41, dec: -2.40 }, // Saiph
        ],
      }
      
      // Draw each constellation
      Object.entries(constellationData).forEach(([name, stars]) => {
        // Calculate positions of all stars in the constellation
        const points: [number, number][] = []
        const visibleStars: { x: number, y: number }[] = []
        
        stars.forEach(star => {
          const position = calculateStarPosition(star.ra, star.dec, lst, latitude)
          
          if (position.visible) {
            const x = centerX + position.x * radius
            const y = centerY + position.y * radius
            points.push([x, y])
            visibleStars.push({ x, y })
          }
        })
        
        // Only draw if at least 3 stars are visible
        if (visibleStars.length >= 3) {
          // Draw lines connecting stars
          ctx.beginPath()
          ctx.moveTo(points[0][0], points[0][1])
          
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1])
          }
          
          // NASA-inspired blue lines
          ctx.strokeStyle = "rgba(16, 91, 216, 0.6)" // NASA blue
          ctx.lineWidth = 1
          ctx.stroke()
          
          // Draw points at each star
          visibleStars.forEach(({x, y}) => {
            ctx.beginPath()
            ctx.arc(x, y, 2, 0, Math.PI * 2)
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
            ctx.fill()
          })
          
          // Label the constellation
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
          ctx.font = "bold 14px serif"
          ctx.fillText(name, points[0][0], points[0][1] - 10)
        }
      })

      // Draw planets with accurate positions
      planets.forEach((planet: { name: string; ra: number; dec: number; color: string; size: number }) => {
        const position = calculateStarPosition(planet.ra, planet.dec, lst, latitude)
        
        if (position.visible) {
          // Convert normalized coordinates to canvas coordinates
          const x = centerX + position.x * radius
          const y = centerY + position.y * radius
          
          // Planet glow
          const glow = ctx.createRadialGradient(x, y, 0, x, y, planet.size * 3)
          glow.addColorStop(0, `${planet.color}40`) // 25% opacity
          glow.addColorStop(1, "rgba(0, 0, 0, 0)")

          ctx.beginPath()
          ctx.arc(x, y, planet.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = glow
          ctx.fill()

          // Planet body
          ctx.beginPath()
          ctx.arc(x, y, planet.size, 0, Math.PI * 2)
          ctx.fillStyle = planet.color
          ctx.fill()

          // Planet ring (for Saturn)
          if (planet.name === "Saturn") {
            ctx.beginPath()
            ctx.ellipse(x, y, planet.size * 1.8, planet.size * 0.5, Math.PI / 4, 0, Math.PI * 2)
            ctx.strokeStyle = "rgba(184, 163, 85, 0.7)" // Gold color for rings
            ctx.lineWidth = 1.5
            ctx.stroke()
          }

          // Label the planet with NASA-inspired typography
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
          ctx.font = "bold 14px serif"
          ctx.fillText(planet.name, x - planet.size, y - planet.size - 8)
        }
      })

      // Calculate Moon position (simplified)
      const moonRA = (lst + 6) % 24 // Simplified calculation
      const moonDEC = 23.4 * Math.sin(2 * Math.PI * moonPhase) // Simplified declination based on phase
      const moonPosition = calculateStarPosition(moonRA, moonDEC, lst, latitude)
      
      if (moonPosition.visible) {
        // Convert normalized coordinates to canvas coordinates
        const moonX = centerX + moonPosition.x * radius
        const moonY = centerY + moonPosition.y * radius
        const moonRadius = 18

        // Moon glow
        const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 3)
        moonGlow.addColorStop(0, "rgba(255, 255, 255, 0.3)")
        moonGlow.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.beginPath()
        ctx.arc(moonX, moonY, moonRadius * 3, 0, Math.PI * 2)
        ctx.fillStyle = moonGlow
        ctx.fill()

        // Draw moon
        ctx.beginPath()
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2)
        ctx.fillStyle = "#f0f0f0"
        ctx.fill()

        // Draw shadow to show moon phase
        ctx.beginPath()
        ctx.arc(moonX, moonY, moonRadius, -Math.PI / 2, Math.PI / 2)
        ctx.arc(moonX + 5 * Math.sin(moonPhase * Math.PI * 2), moonY, moonRadius, Math.PI / 2, -Math.PI / 2, true)
        ctx.fillStyle = "#020a18" // Deep space blue
        ctx.fill()

        // Label the moon with NASA-inspired typography
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
        ctx.font = "bold 14px serif"
        ctx.fillText("Moon", moonX - moonRadius, moonY - moonRadius - 8)

      }

      // Draw compass directions with NASA-inspired styling
      const padding = 20
      ctx.font = "bold 16px serif"
      ctx.fillStyle = "rgba(184, 163, 85, 0.8)" // NASA gold

      ctx.fillText("N", canvas.width / 2, padding + 10)
      ctx.fillText("S", canvas.width / 2, canvas.height - padding)
      ctx.fillText("E", canvas.width - padding - 10, canvas.height / 2)
      ctx.fillText("W", padding + 10, canvas.height / 2)

      // Draw grid lines (subtle)
      ctx.strokeStyle = "rgba(16, 91, 216, 0.1)" // NASA blue, very transparent
      ctx.lineWidth = 1

      // Horizontal grid lines
      for (let i = 1; i < 10; i++) {
        const y = (canvas.height / 10) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Vertical grid lines
      for (let i = 1; i < 10; i++) {
        const x = (canvas.width / 10) * i
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      setIsLoading(false)
    }

    try {
      renderSkyMap()
      setError(null)
    } catch (err) {
      setError("Failed to render sky map")
      setIsLoading(false)
    }

    // Re-render when window is resized
    const handleResize = () => {
      renderSkyMap()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [date, time, latitude, longitude])

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-nasa-space bg-opacity-70 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-nasa-blue" />
          <span className="ml-2 font-mono text-white">Rendering sky map...</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-nasa-space bg-opacity-70 z-10">
          <p className="text-nasa-red font-mono">{error}</p>
        </div>
      )}

      <canvas ref={canvasRef} className="w-full h-full" />

      <div className="absolute bottom-3 right-3 text-xs font-mono bg-nasa-space/70 text-nasa-gold p-2 rounded">
        {format(date, "PPP")} at {time} | {latitude.toFixed(2)}°, {longitude.toFixed(2)}°
      </div>
    </div>
  )
}
