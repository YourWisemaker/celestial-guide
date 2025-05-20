// Environment configuration with fallbacks and validation
export const env = {
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
}

// Validate environment configuration
export function validateEnv() {
  const missingVars: string[] = []
  
  if (!env.OPENROUTER_API_KEY) {
    missingVars.push('OPENROUTER_API_KEY')
  }
  
  if (missingVars.length > 0) {
    console.warn(`Missing environment variables: ${missingVars.join(', ')}. Some features may not work correctly.`)
    return false
  }
  
  return true
}
