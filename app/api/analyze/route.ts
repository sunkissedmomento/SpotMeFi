// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generatePlaylistIntent } from '@/lib/ai/claude'

/**
 * POST /api/analyze
 *
 * Analyzes a playlist prompt and returns intent with optional clarification questions.
 * This is called BEFORE generating the playlist to gather missing context.
 *
 * Request body:
 * {
 *   "prompt": "sol at luna by geiko playlist",
 *   "answers": { "mood": "melancholic", "includesSimilar": "yes" } // optional
 * }
 *
 * Response:
 * {
 *   "intent": { ...PlaylistIntent },
 *   "needsClarification": true/false,
 *   "confidence": "low" | "medium" | "high",
 *   "questions": [...ClarificationQuestion]
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt, answers } = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
    }

    // Generate intent with clarification detection
    const intent = await generatePlaylistIntent(prompt, answers ? { answers } : undefined)

    return NextResponse.json({
      intent,
      needsClarification: intent.needsClarification || false,
      confidence: intent.confidence || 'medium',
      questions: intent.clarificationQuestions || [],
    })
  } catch (err) {
    console.error('Error analyzing prompt:', err)
    return NextResponse.json({ error: 'Failed to analyze prompt' }, { status: 500 })
  }
}
