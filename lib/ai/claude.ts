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
  confirmed_artists?: string[]

  // ✅ Added for language/region filtering
  language?: string       // e.g., "English", "Spanish", "Korean"
  region?: string         // e.g., "US", "UK", "K-pop", "Latin"

  // ✅ Added for clarification flow
  needsClarification?: boolean
  clarificationQuestions?: ClarificationQuestion[]
  confidence?: 'high' | 'medium' | 'low'
}

export interface ClarificationQuestion {
  id: string
  question: string
  type: 'single-choice' | 'multi-choice' | 'text'
  options?: string[]
  suggestedAnswer?: string
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generatePlaylistIntent(
  prompt: string,
  previousContext?: { answers?: Record<string, string> },
  userPreferences?: { topArtists: string[], topGenres: string[] }
): Promise<PlaylistIntent> {
  const systemPrompt = `You are a music expert AI. Your job is to extract structured playlist intent from user requests.

IMPORTANT: Detect if the request needs clarification and suggest helpful questions.

- Focus on the latest music (2025) unless the user specifies older years.
- If a specific artist is mentioned, include them in artist_name and playlist_title, clear genres and keywords.
- If a number of tracks is specified, set track_limit. Otherwise leave track_limit as null to include ALL matching tracks.
- If user preferences (top artists/genres) are provided, consider them when making recommendations for vague requests.
- Detect genres, moods, and energy level from the prompt.
- Detect language and region if mentioned.
- Extract confirmed artists.
- Return JSON only with no extra text.

CLARIFICATION RULES:
- Set needsClarification: true if the prompt is vague or ambiguous
- Set confidence: "low" if missing key info, "medium" if some info is clear, "high" if very specific
- Generate 2-4 clarification questions to gather missing context:
  1. Mood/vibe question (if not clear)
  2. Similar artists inclusion (if only one artist mentioned)
  3. Activity/context (if applicable)
  4. Era/year preference (if not specified)

Response format:
{
  "playlist_title": "Catchy title",
  "playlist_description": "Brief description",
  "genres": ["pop", "hip-hop"],
  "moods": ["energetic", "happy"],
  "energy_level": "high",
  "year_focus": "recent",
  "year_range": { "start": 2025, "end": 2025 },
  "include_popular": true,
  "include_emerging": false,
  "keywords": ["new", "trending"],
  "track_limit": null,
  "artist_name": "Optional artist",
  "confirmed_artists": ["Example Artist"],
  "language": "English",
  "region": "US",
  "needsClarification": false,
  "confidence": "high",
  "clarificationQuestions": [
    {
      "id": "mood",
      "question": "What mood are you going for?",
      "type": "single-choice",
      "options": ["Happy/Upbeat", "Sad/Melancholic", "Energetic/Hype", "Calm/Relaxing"],
      "suggestedAnswer": "Calm/Relaxing"
    }
  ]
}

EXAMPLES:

Prompt: "sol at luna by geiko playlist"
→ needsClarification: true, confidence: "medium"
→ Questions:
  - "What vibe: just geiko's songs or similar Filipino indie artists too?"
  - "Mood: melancholic love songs like 'Sol at Luna' or upbeat tracks?"
  - "Include similar OPM artists like dwta, Keiko Necesario?"

Prompt: "workout music"
→ needsClarification: true, confidence: "low"
→ Questions:
  - "What genre: pop, hip-hop, EDM, rock?"
  - "Energy level: intense (HIIT), moderate (jogging), or light (yoga)?"
  - "Any favorite artists?"

Prompt: "Taylor Swift songs for driving at night, 30 tracks"
→ needsClarification: false, confidence: "high"
→ Clear intent: artist, context, track count specified`

  // Build the user message with context if available
  let userMessage = `Extract playlist intent from: "${prompt}"`

  // Add user preferences if available
  if (userPreferences && userPreferences.topArtists.length > 0) {
    userMessage += `\n\nUser's music taste (from listening history):\n`
    userMessage += `- Top Artists: ${userPreferences.topArtists.slice(0, 10).join(', ')}\n`
    if (userPreferences.topGenres.length > 0) {
      userMessage += `- Preferred Genres: ${userPreferences.topGenres.join(', ')}\n`
    }
    userMessage += `\nConsider this when the user's prompt is vague or doesn't specify artists/genres. For example:\n`
    userMessage += `- If they say "chill music", prioritize artists they already listen to\n`
    userMessage += `- If they say "something new", use similar artists from their preferred genres\n`
    userMessage += `- If they're specific about an artist/genre, ignore preferences and use their request\n`
  }

  if (previousContext?.answers) {
    userMessage += `\n\nUser provided additional context:\n`
    Object.entries(previousContext.answers).forEach(([questionId, answer]) => {
      userMessage += `- ${questionId}: ${answer}\n`
    })
    userMessage += `\nUse this context to refine the intent. Set needsClarification: false and confidence: "high".`
  }

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1000,
    temperature: 0.7,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userMessage },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude')

  try {
    const parsed = JSON.parse(content.text)
    return parsed as PlaylistIntent
  } catch (error) {
    console.error('Failed to parse Claude response:', content.text)
    throw new Error('Failed to analyze playlist intent')
  }
}

/**
 * Refines a playlist intent based on user answers to clarification questions
 */
export async function refinePlaylistIntent(
  originalPrompt: string,
  answers: Record<string, string>
): Promise<PlaylistIntent> {
  return generatePlaylistIntent(originalPrompt, { answers })
}

/**
 * Converts user answers to an enhanced prompt string
 */
export function buildEnhancedPrompt(
  originalPrompt: string,
  answers: Record<string, string>
): string {
  let enhanced = originalPrompt

  // Add context from answers
  const contextParts: string[] = []

  if (answers.mood) contextParts.push(`mood: ${answers.mood}`)
  if (answers.includeSimilar === 'yes') contextParts.push('include similar artists')
  if (answers.activity) contextParts.push(`for ${answers.activity}`)
  if (answers.era) contextParts.push(`from ${answers.era}`)
  if (answers.genre) contextParts.push(`genre: ${answers.genre}`)
  if (answers.energy) contextParts.push(`energy: ${answers.energy}`)

  if (contextParts.length > 0) {
    enhanced += ` (${contextParts.join(', ')})`
  }

  return enhanced
}

export interface PlaylistRefinementResult {
  tracksToAdd: string[]      // Track search queries (e.g., "artist - song name")
  tracksToRemove: string[]   // Track IDs to remove from playlist
  reasoning: string          // Explanation of changes
}

/**
 * Refines an existing playlist based on user's additional prompt
 */
export async function refineExistingPlaylist(
  originalPrompt: string,
  currentTracks: Array<{ id: string; name: string; artists: Array<{ name: string }> }>,
  refinementPrompt: string
): Promise<PlaylistRefinementResult> {
  const systemPrompt = `You are a music expert AI. Your job is to refine existing playlists based on user feedback.

The user will provide:
1. Original prompt used to create the playlist
2. Current list of tracks in the playlist
3. Refinement request (e.g., "add more upbeat songs", "remove slow tracks")

Your task:
- Analyze the refinement request
- Determine which tracks to ADD (return as search queries: "artist - song name")
- Determine which tracks to REMOVE (return as track IDs)
- Provide clear reasoning for the changes

Response format (JSON only, no extra text):
{
  "tracksToAdd": ["Artist Name - Song Name", "Another Artist - Another Song"],
  "tracksToRemove": ["track_id_1", "track_id_2"],
  "reasoning": "Added 5 upbeat tracks to increase energy. Removed 3 slow ballads that didn't fit the vibe."
}

RULES:
- For "add more X" requests: return 5-10 track search queries
- For "remove Y" requests: identify track IDs from current list that match criteria
- For "make it more Z" requests: both add and remove tracks
- For "add X tracks" with specific number: return that many track queries
- If refinement is vague, make reasonable assumptions based on original prompt
- Track search queries should be: "Artist Name - Song Title" format`

  const trackList = currentTracks
    .map((t, i) => `${i + 1}. [${t.id}] ${t.artists.map(a => a.name).join(', ')} - ${t.name}`)
    .join('\n')

  const userMessage = `Original prompt: "${originalPrompt}"

Current tracks (${currentTracks.length} total):
${trackList}

Refinement request: "${refinementPrompt}"

Analyze and return the tracks to add/remove in JSON format.`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1500,
    temperature: 0.7,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userMessage },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude')

  try {
    const parsed = JSON.parse(content.text)
    return {
      tracksToAdd: parsed.tracksToAdd || [],
      tracksToRemove: parsed.tracksToRemove || [],
      reasoning: parsed.reasoning || 'Playlist refined based on your request',
    }
  } catch (error) {
    console.error('Failed to parse Claude response:', content.text)
    throw new Error('Failed to analyze refinement request')
  }
}
