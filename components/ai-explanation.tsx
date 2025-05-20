"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Stars } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface AIExplanationProps {
  date: Date
  time: string
  latitude: number
  longitude: number
  locationName: string
}

export default function AIExplanation({ date, time, latitude, longitude, locationName }: AIExplanationProps) {
  const [explanation, setExplanation] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { toast } = useToast()

  const generateExplanation = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/sky-explanation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: format(date, "yyyy-MM-dd"),
          time,
          latitude,
          longitude,
          locationName,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate explanation")
      }

      const data = await response.json()
      setExplanation(data.explanation)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI explanation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate explanation when parameters change
  useEffect(() => {
    generateExplanation()
  }, [date, time, latitude, longitude])

  return (
    <Card className="bg-nasa-space border-nasa-blue/30 overflow-hidden rounded-lg shadow-lg shadow-nasa-blue/20">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif text-white border-b border-nasa-blue/30 pb-2 w-full flex items-center">
            <Stars className="mr-2 h-5 w-5 text-nasa-gold" />
            Mission Briefing
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-nasa-blue mb-4" />
            <p className="text-white font-mono">Analyzing celestial data...</p>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            {explanation ? (
              <div className="text-white space-y-4 font-serif leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, "<br />") }} />
              </div>
            ) : (
              <p className="text-slate-400 italic font-mono">
                No celestial data available. Click refresh to generate analysis.
              </p>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={generateExplanation}
                disabled={isLoading}
                className="bg-nasa-stardust border-nasa-blue/30 hover:bg-nasa-navy/20 text-white font-mono"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Analysis
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
