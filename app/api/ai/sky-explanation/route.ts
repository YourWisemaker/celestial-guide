import { NextResponse } from "next/server"
import OpenAI from "openai"
import { env, validateEnv } from "@/lib/env"

export async function POST(request: Request) {
  try {
    // Log the incoming request parameters (for debugging)
    console.log("Received request for AI explanation")
    
    // Use the API key from env module
    const apiKey = env.OPENROUTER_API_KEY
    
    // Log API key status (without revealing the key)
    console.log("API key check:", apiKey ? "Key exists" : "Missing key")
    
    // Validate environment variables
    if (!apiKey) {
      console.error("OpenRouter API key is missing")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const { date, time, latitude, longitude, locationName } = await request.json()

    if (!date || !time || !latitude || !longitude || !locationName) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Initialize OpenAI client with OpenRouter's base URL
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://celestial-guide.vercel.app",
        "X-Title": "Celestial Guide",
        // OpenRouter required headers
        "Content-Type": "application/json"
      }
    })
    
    console.log("OpenAI client initialized with OpenRouter base URL")

    // Log input parameters
    console.log("Input parameters:", { date, time, latitude, longitude, locationName })
    
    // Generate AI explanation using a valid OpenRouter model
    console.log("Sending request to OpenRouter...")
    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // Use a reliable model that's definitely available on OpenRouter
      messages: [
        {
          role: "system",
          content: "You are an expert astronomer providing accurate and engaging information about the night sky."
        },
        {
          role: "user",
          content: `Provide a detailed explanation of what would be visible in the night sky on ${date} at ${time} from the location: ${locationName} (coordinates: ${latitude}, ${longitude}).
          
          Include information about:
          - Visible planets and their positions
          - Notable stars and constellations
          - Moon phase and position (if visible)
          - Any special astronomical events (meteor showers, eclipses, etc.)
          - Brief interesting facts about some of the visible celestial objects
          
          Format your response in a conversational, engaging way that would help a stargazer understand what they're looking at. Keep your response under 400 words.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
    
    const text = response.choices[0]?.message?.content || ""

    return NextResponse.json({ explanation: text })
  } catch (error) {
    // Detailed error logging
    console.error("Error generating AI explanation:", error)
    
    let errorMessage = "Failed to generate AI explanation"
    let status = 500
    
    // More specific error messages based on error type
    if (error instanceof Error) {
      errorMessage = error.message
      console.error("Error stack:", error.stack)
      
      // Check for auth errors
      if (error.message.includes("authentication") || error.message.includes("API key")) {
        errorMessage = "API authentication error - check your OpenRouter API key"
        status = 401
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status })
  }
}
