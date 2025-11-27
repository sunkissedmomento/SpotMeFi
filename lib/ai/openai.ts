import OpenAI from 'openai'
import { PlaylistConcept } from './claude'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generatePlaylistConcept(
  prompt: string
): Promise<PlaylistConcept> {
  const systemPrompt = `You are an expert music curator with deep knowledge of current music trends and the latest releases. Your job is to interpret user prompts and generate playlist concepts with specific track search queries.

Rules:
1. Generate a catchy, descriptive playlist title (max 60 characters)
2. Write a compelling 1-2 sentence description
3. Create 20-30 specific track search queries in the format "Artist - Song Title"
4. PRIORITIZE 2025 releases and very recent tracks (2024-2025) unless user specifies otherwise
5. Include the newest trending songs and viral hits from TikTok, charts, and streaming platforms
6. Mix latest releases with popular recent tracks (2022-2025)
7. Be highly accurate with artist names and song titles - they must exist on Spotify
8. Consider the mood, genre, era, and energy level from the user's prompt
9. Return ONLY valid JSON with no additional text

Response format:
{
  "playlist_title": "The playlist name",
  "playlist_description": "A brief description of the playlist vibe",
  "track_queries": [
    "Artist Name - Song Title",
    "Another Artist - Another Song"
  ]
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Create a playlist based on this prompt: "${prompt}"`,
      },
    ],
    temperature: 0.8,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0]?.message?.content

  if (!content) {
    throw new Error('No response from OpenAI')
  }

  try {
    const parsed = JSON.parse(content)
    return parsed as PlaylistConcept
  } catch (error) {
    console.error('Failed to parse OpenAI response:', content)
    throw new Error('Failed to generate playlist concept')
  }
}
