import { Suspense } from "react"
import SkyMapExplorer from "@/components/sky-map-explorer"
import { Loader2 } from "lucide-react"
import StarsBackground from "@/components/stars-background"

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <StarsBackground />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 text-white tracking-tight">Celestial Guide</h1>
          <p className="text-lg md:text-xl text-nasa-gold font-mono max-w-2xl mx-auto">
            Explore the cosmos and discover what's visible in your night sky
          </p>
        </header>

        <Suspense
          fallback={
            <div className="flex justify-center items-center h-[70vh]">
              <Loader2 className="h-8 w-8 animate-spin text-nasa-blue" />
              <span className="ml-2 font-mono text-white">Initializing sky map...</span>
            </div>
          }
        >
          <SkyMapExplorer />
        </Suspense>

        <footer className="mt-16 text-center text-sm text-slate-400 font-mono">
          <p>© {new Date().getFullYear()} Celestial Guide. All rights reserved.</p>
          <p className="mt-1">Powered by AI and astronomical data.</p>
        </footer>
      </div>
    </main>
  )
}
