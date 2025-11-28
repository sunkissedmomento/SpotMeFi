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
  previousContext?: { answers?: Record<string, string> }
): Promise<PlaylistIntent> {
  const systemPrompt = `You are a music expert AI. Your job is to extract structured playlist intent from user requests.

IMPORTANT: Detect if the request needs clarification and suggest helpful questions.

- Focus on the latest music (2025) unless the user specifies older years.
- If a specific artist is mentioned, include them in artist_name and playlist_title, clear genres and keywords.
- If a number of tracks is specified, set track_limit. Otherwise leave track_limit as null to include ALL matching tracks.
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
