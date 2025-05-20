"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, MapPin, RefreshCw, Search } from "lucide-react"
import SkyMap from "@/components/sky-map"
import AIExplanation from "@/components/ai-explanation"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

interface LocationData {
  latitude: number
  longitude: number
  displayName: string
}

export default function SkyMapExplorer() {
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState<string>(format(new Date(), "HH:mm"))
  const [location, setLocation] = useState<LocationData>({
    latitude: 40.7128,
    longitude: -74.006,
    displayName: "New York, NY, USA",
  })
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false)
  const { toast } = useToast()
  const isMobile = useMobile()

  // Get current location
  const getCurrentLocation = () => {
    setIsLoading(true)

    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          // Reverse geocode to get location name using OpenRoute API
          const response = await fetch(`/api/location/reverse?lat=${latitude}&lon=${longitude}`)

          if (!response.ok) {
            throw new Error("Failed to get location name")
          }

          const data = await response.json()

          setLocation({
            latitude,
            longitude,
            displayName: data.displayName,
          })

          toast({
            title: "Location updated",
            description: `Your location: ${data.displayName}`,
          })
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to get your location details",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      },
      (error) => {
        toast({
          title: "Error",
          description: "Failed to get your location. Please check your permissions.",
          variant: "destructive",
        })
        setIsLoading(false)
      },
    )
  }

  // Search for a location
  const searchLocation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a location to search",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/location/search?q=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        throw new Error("Failed to search location")
      }

      const data = await response.json()

      if (data && data.latitude && data.longitude) {
        setLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          displayName: data.displayName,
        })

        toast({
          title: "Location updated",
          description: `Location set to: ${data.displayName}`,
        })
      } else {
        toast({
          title: "Error",
          description: "Location not found. Please try a different search term.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search for location",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle time change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value)
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Sky Map - Full width */}
      <Card className="w-full bg-nasa-space border-nasa-blue/30 overflow-hidden rounded-lg shadow-lg shadow-nasa-blue/20">
        <CardContent className="p-0 overflow-hidden">
          <div className="relative h-[600px] w-full">
            <SkyMap date={date} time={time} latitude={location.latitude} longitude={location.longitude} />
          </div>
        </CardContent>
      </Card>

      {/* Controls - Two column layout on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission Parameters Card */}
        <Card className="bg-nasa-space border-nasa-blue/30 overflow-hidden rounded-lg shadow-lg shadow-nasa-blue/20">
          <CardContent className="p-6">
            <h2 className="text-xl font-serif mb-4 text-white border-b border-nasa-blue/30 pb-2">Mission Parameters</h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-nasa-gold font-mono text-sm">
                  Date
                </Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-mono bg-nasa-stardust border-nasa-blue/30 hover:bg-nasa-navy/20 text-white"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-nasa-gold" />
                      {format(date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-nasa-space border-nasa-blue/30">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => {
                        setDate(date || new Date())
                        setIsCalendarOpen(false)
                      }}
                      initialFocus
                      className="bg-nasa-space text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-nasa-gold font-mono text-sm">
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={handleTimeChange}
                  className="bg-nasa-stardust border-nasa-blue/30 text-white font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Coordinates Card */}
        <Card className="bg-nasa-space border-nasa-blue/30 overflow-hidden rounded-lg shadow-lg shadow-nasa-blue/20">
          <CardContent className="p-6">
            <h2 className="text-xl font-serif mb-4 text-white border-b border-nasa-blue/30 pb-2">
              Location Coordinates
            </h2>

            <Tabs defaultValue="search" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-nasa-stardust">
                <TabsTrigger value="search" className="data-[state=active]:bg-nasa-navy data-[state=active]:text-white">
                  Search
                </TabsTrigger>
                <TabsTrigger
                  value="current"
                  className="data-[state=active]:bg-nasa-navy data-[state=active]:text-white"
                >
                  Current
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="mt-4">
                <form onSubmit={searchLocation} className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter a location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-nasa-stardust border-nasa-blue/30 text-white font-mono"
                    />
                    <Button type="submit" disabled={isLoading} className="bg-nasa-blue hover:bg-nasa-navy text-white">
                      {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="current" className="mt-4">
                <Button
                  onClick={getCurrentLocation}
                  disabled={isLoading}
                  className="w-full bg-nasa-blue hover:bg-nasa-navy text-white"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Getting location...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Use my current location
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>

            <div
              className={cn(
                "mt-4 p-3 rounded-md bg-nasa-stardust text-sm border border-nasa-blue/20",
                isMobile ? "text-xs" : "",
              )}
            >
              <p className="font-mono text-nasa-gold">Current Location:</p>
              <p className="text-white font-serif mt-1">{location.displayName}</p>
              <p className="text-slate-400 font-mono text-xs mt-2">
                Lat: {location.latitude.toFixed(4)}° | Lon: {location.longitude.toFixed(4)}°
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Explanation - Full width */}
      <AIExplanation
        date={date}
        time={time}
        latitude={location.latitude}
        longitude={location.longitude}
        locationName={location.displayName}
      />
    </div>
  )
}
