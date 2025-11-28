import Anthropic from '@anthropic-ai/sdk'

export interface PlaylistIntent {
  playlist_title: string
  playlist_description: string
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

Important guidelines:
1. Focus on RECENT music (2024-2025) unless user specifies otherwise
2. Extract genres, moods, and vibes from the prompt
3. Determine energy level: low (chill/relaxing), medium (moderate), high (energetic/hype)
4. For "latest", "new", "trending" requests → set year_focus: "recent" and include_popular: true
5. Create a catchy playlist title and description
6. Extract keywords that can be used for Spotify searches
7. Return ONLY valid JSON with no additional text

Response format:
{
  "playlist_title": "Catchy title (max 60 chars)",
  "playlist_description": "Brief 1-2 sentence description",
  "genres": ["pop", "hip-hop"],
  "moods": ["energetic", "happy"],
  "energy_level": "high",
  "year_focus": "recent",
  "year_range": { "start": 2024, "end": 2025 },
  "include_popular": true,
  "include_emerging": false,
  "keywords": ["viral", "trending", "upbeat"]
}`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1000,
    temperature: 0.7,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' }
      }
    ],
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
