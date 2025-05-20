# Celestial Guide

An interactive sky map application that allows you to explore the cosmos and discover what's visible in your night sky based on your location and time.

## Features

- Dynamic sky map rendering based on:
  - Date and time
  - Location coordinates
  - Visible astronomical objects (stars, planets, moon)
- Location services:
  - Search any location worldwide
  - Use your current location
- AI-powered sky explanations using OpenAI's GPT-3.5-Turbo via OpenRouter

## Setup

### Prerequisites

- Node.js 16+
- npm or pnpm

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

You'll need to sign up for an [OpenRouter](https://openrouter.ai) account to get an API key.

### Installation

```bash
npm install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Technologies Used

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS for styling
- OpenStreetMap Nominatim API for geocoding
- OpenRouter API for access to OpenAI's GPT-3.5-Turbo LLM
- Canvas-based sky map visualization
- dotenv for environment variable management
