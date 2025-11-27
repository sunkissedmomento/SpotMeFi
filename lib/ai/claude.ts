import Anthropic from '@anthropic-ai/sdk'

export interface PlaylistConcept {
  playlist_title: string
  playlist_description: string
  track_queries: string[]
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generatePlaylistConcept(
  prompt: string
): Promise<PlaylistConcept> {
  const systemPrompt = `You are a music expert and playlist curator. Your job is to interpret user prompts and generate playlist concepts with specific track search queries.

Rules:
1. Generate a catchy, descriptive playlist title (max 60 characters)
2. Write a compelling 1-2 sentence description
3. Create 20-30 specific track search queries in the format "Artist - Song Title"
4. Be creative but accurate - suggest real, well-known tracks that match the vibe
5. Consider the mood, genre, era, and energy level from the user's prompt
6. Return ONLY valid JSON with no additional text

Response format:
{
  "playlist_title": "The playlist name",
  "playlist_description": "A brief description of the playlist vibe",
  "track_queries": [
    "Artist Name - Song Title",
    "Another Artist - Another Song"
  ]
}`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    temperature: 0.8,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Create a playlist based on this prompt: "${prompt}"`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  try {
    const parsed = JSON.parse(content.text)
    return parsed as PlaylistConcept
  } catch (error) {
    console.error('Failed to parse Claude response:', content.text)
    throw new Error('Failed to generate playlist concept')
  }
}
