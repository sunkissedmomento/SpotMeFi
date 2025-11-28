import Anthropic from '@anthropic-ai/sdk'

export interface PlaylistIntent {
  playlist_title: string
  playlist_description: string
  artist_name?: string
  track_limit?: number
  genres: string[]
  moods: string[]
  energy_level: 'low' | 'medium' | 'high'
  year_focus: 'recent' | 'classic' | 'mixed' | 'specific'
  year_range?: { start: number; end: number }
  include_popular: boolean
  include_emerging: boolean
  keywords: string[]
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generatePlaylistIntent(
  prompt: string
): Promise<PlaylistIntent> {
  const systemPrompt = `You are a music expert who analyzes user requests and extracts their intent for playlist creation.

Your job is to understand what the user wants and return structured search parameters that will be used with Spotify's API to find real, current tracks.

The current year is 2025. Focus on the LATEST music unless the user specifies older time periods.

Important guidelines:
1. If the user mentions a SPECIFIC ARTIST NAME (like "Hev Abi", "Drake", "Taylor Swift"):
   - Set artist_name to the EXACT artist name mentioned
   - Set playlist_title to include the artist name
   - Clear genres, keywords arrays (they won't be used)

2. If the user specifies a NUMBER of songs (like "50 songs", "maximum 50", "100 tracks", "all songs"):
   - Set track_limit to that number
   - For "all" or "maximum" or "complete" → set track_limit to 100
   - If NOT specified → omit track_limit (defaults to 30)

3. For "latest", "new", "trending", "recent" requests (WITHOUT specific artist):
   - Set year_focus: "recent"
   - Set year_range: { "start": 2025, "end": 2025 }
   - Set include_popular: true
   - Use keywords like: ["new", "2025", "trending"]

4. Extract genres, moods, and vibes from the prompt
5. Determine energy level: low (chill/relaxing), medium (moderate), high (energetic/hype)
6. Create a catchy playlist title and description
7. Return ONLY valid JSON with no additional text

Response format (artist-specific with track limit):
{
  "playlist_title": "Hev Abi Complete Collection",
  "playlist_description": "A curated collection featuring all tracks by the artist Hev Abi",
  "artist_name": "Hev Abi",
  "track_limit": 50,
  "genres": [],
  "moods": [],
  "energy_level": "medium",
  "year_focus": "mixed",
  "include_popular": false,
  "include_emerging": false,
  "keywords": []
}

Response format (genre/vibe-based):
{
  "playlist_title": "Catchy title (max 60 chars)",
  "playlist_description": "Brief 1-2 sentence description",
  "genres": ["pop", "hip-hop"],
  "moods": ["energetic", "happy"],
  "energy_level": "high",
  "year_focus": "recent",
  "year_range": { "start": 2025, "end": 2025 },
  "include_popular": true,
  "include_emerging": false,
  "keywords": ["new", "2025", "viral"]
}`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1000,
    temperature: 0.7,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Analyze this playlist request and extract the intent: "${prompt}"`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  try {
    const parsed = JSON.parse(content.text)
    return parsed as PlaylistIntent
  } catch (error) {
    console.error('Failed to parse Claude response:', content.text)
    throw new Error('Failed to analyze playlist intent')
  }
}
