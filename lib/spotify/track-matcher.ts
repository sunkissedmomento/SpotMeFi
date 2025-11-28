// lib/spotify/track-matcher.ts
import { SpotifyTrack, SpotifyTrackWithFeatures, SpotifyAudioFeatures } from './types'
import { PlaylistIntent } from '../ai/claude'

/**
 * Comprehensive checklist for evaluating track fit against user prompt
 */
export interface TrackMatchChecklist {
  // 1. Song / Track Info
  trackInfo: {
    titleMatch: boolean           // Track title mentioned in prompt
    albumMatch: boolean            // Album name mentioned or detected
    artistMatch: boolean           // Artist is in confirmed_artists
    featuredArtistMatch: boolean   // Featured artist detected
    versionMatch: boolean          // Cover/Remix/Live/Acoustic/Radio version
    explicitLabel: boolean         // Explicit/Clean preference
  }

  // 2. Genre / Style
  genre: {
    mainGenreMatch: boolean        // Main genre matches
    subGenreMatch: boolean         // Sub-genre matches
    fusionGenreMatch: boolean      // Fusion genre detected
    eraSpecificGenre: boolean      // Era-specific genre (90s rock, 2000s emo)
  }

  // 3. Mood / Emotion / Vibe
  mood: {
    emotionalTone: boolean         // Happy, sad, romantic match
    energyVibe: boolean            // Calm, hype, dreamy match
    valenceMatch: boolean          // Positive vs negative sentiment
  }

  // 4. Activity / Theme / Context
  context: {
    activityMatch: boolean         // Workout, study, driving, party
    settingMatch: boolean          // Morning, night, festival, road trip
    occasionMatch: boolean         // Holiday, birthday, wedding
  }

  // 5. Audio Features
  audioFeatures: {
    tempoMatch: boolean            // BPM in expected range
    energyMatch: boolean           // Energy level (0-1) match
    danceabilityMatch: boolean     // Danceability (0-1) match
    valenceMatch: boolean          // Valence (0-1) match
    acousticnessMatch: boolean     // Acoustic vs electronic
    instrumentalnessMatch: boolean // Instrumental preference
    speechinessMatch: boolean      // Rap vs sung content
    livenessMatch: boolean         // Live vs studio
  }

  // 6. Time / Era
  timeEra: {
    releaseYearMatch: boolean      // Specific year match
    decadeMatch: boolean           // Decade match (70s, 80s)
    eraDescriptor: boolean         // Classic/modern style
  }

  // 7. Popularity / Charts
  popularity: {
    popularityLevel: boolean       // Popular/trending vs underground
    viralMatch: boolean            // Viral status match
    chartRank: boolean             // Chart performance
  }

  // 8. Language / Region
  languageRegion: {
    languageMatch: boolean         // Language preference
    regionMatch: boolean           // Regional/nationality match
  }

  // 9. Instrumentation / Sound
  sound: {
    instrumentationMatch: boolean  // Guitar, piano, orchestral, electronic
    soundDescriptor: boolean       // Lo-fi, cinematic, ambient, heavy
    remixType: boolean             // Remix type match
  }
}

/**
 * Scoring result with checklist and overall score
 */
export interface TrackMatchScore {
  track: SpotifyTrackWithFeatures
  checklist: TrackMatchChecklist
  overallScore: number            // 0-100
  categoryScores: {
    trackInfo: number
    genre: number
    mood: number
    context: number
    audioFeatures: number
    timeEra: number
    popularity: number
    languageRegion: number
    sound: number
  }
  matchReason: string              // Human-readable explanation
}

/**
 * Evaluates a track against the playlist intent using comprehensive checklist
 */
export function scoreTrackMatch(
  track: SpotifyTrackWithFeatures,
  intent: PlaylistIntent,
  prompt: string
): TrackMatchScore {
  const promptLower = prompt.toLowerCase()
  const trackName = track.name.toLowerCase()
  const artistNames = track.artists.map(a => a.name.toLowerCase())
  const albumName = track.album.name.toLowerCase()

  // Initialize checklist
  const checklist: TrackMatchChecklist = {
    trackInfo: {
      titleMatch: promptLower.includes(trackName) || trackName.includes(promptLower.split(' ')[0]),
      albumMatch: promptLower.includes(albumName),
      artistMatch: intent.confirmed_artists?.some(a => artistNames.includes(a.toLowerCase())) || false,
      featuredArtistMatch: track.name.toLowerCase().includes('feat') &&
                           intent.confirmed_artists?.some(a => trackName.includes(a.toLowerCase())) || false,
      versionMatch: detectVersionMatch(track.name, promptLower),
      explicitLabel: true, // Default true, can filter based on explicit flag if available
    },

    genre: {
      mainGenreMatch: intent.genres.length > 0,
      subGenreMatch: intent.genres.length > 1,
      fusionGenreMatch: intent.genres.length > 2,
      eraSpecificGenre: detectEraGenre(promptLower, intent),
    },

    mood: {
      emotionalTone: detectMoodMatch(intent.moods, promptLower),
      energyVibe: detectEnergyVibe(intent.energy_level, intent.moods),
      valenceMatch: detectValence(intent.moods),
    },

    context: {
      activityMatch: detectActivity(promptLower),
      settingMatch: detectSetting(promptLower),
      occasionMatch: detectOccasion(promptLower),
    },

    audioFeatures: {
      tempoMatch: matchTempo(track.audioFeatures, promptLower),
      energyMatch: matchEnergyLevel(intent.energy_level, track.audioFeatures),
      danceabilityMatch: matchDanceability(intent.moods, promptLower, track.audioFeatures),
      valenceMatch: matchValenceLevel(intent.moods, track.audioFeatures),
      acousticnessMatch: matchAcousticness(promptLower, intent.keywords, track.audioFeatures),
      instrumentalnessMatch: matchInstrumentalness(promptLower, intent.keywords, track.audioFeatures),
      speechinessMatch: matchSpeechiness(intent.genres, promptLower, track.audioFeatures),
      livenessMatch: matchLiveness(promptLower, track.audioFeatures),
    },

    timeEra: {
      releaseYearMatch: intent.year_range?.start !== undefined,
      decadeMatch: detectDecade(promptLower),
      eraDescriptor: detectEraDescriptor(promptLower, intent.year_focus),
    },

    popularity: {
      popularityLevel: intent.include_popular || intent.include_emerging,
      viralMatch: detectViral(promptLower, track.popularity),
      chartRank: track.popularity > 60,
    },

    languageRegion: {
      languageMatch: intent.language !== undefined,
      regionMatch: intent.region !== undefined,
    },

    sound: {
      instrumentationMatch: detectInstrumentation(promptLower, intent.keywords),
      soundDescriptor: detectSoundDescriptor(promptLower, intent.keywords),
      remixType: detectRemixType(track.name, promptLower),
    },
  }

  // Calculate category scores
  const categoryScores = {
    trackInfo: calculateCategoryScore(checklist.trackInfo),
    genre: calculateCategoryScore(checklist.genre),
    mood: calculateCategoryScore(checklist.mood),
    context: calculateCategoryScore(checklist.context),
    audioFeatures: calculateCategoryScore(checklist.audioFeatures),
    timeEra: calculateCategoryScore(checklist.timeEra),
    popularity: calculateCategoryScore(checklist.popularity),
    languageRegion: calculateCategoryScore(checklist.languageRegion),
    sound: calculateCategoryScore(checklist.sound),
  }

  // Weight categories based on importance
  const weights = {
    trackInfo: 0.25,      // Highest priority - direct matches
    genre: 0.15,
    mood: 0.15,
    context: 0.10,
    audioFeatures: 0.10,
    timeEra: 0.10,
    popularity: 0.05,
    languageRegion: 0.05,
    sound: 0.05,
  }

  const overallScore =
    categoryScores.trackInfo * weights.trackInfo +
    categoryScores.genre * weights.genre +
    categoryScores.mood * weights.mood +
    categoryScores.context * weights.context +
    categoryScores.audioFeatures * weights.audioFeatures +
    categoryScores.timeEra * weights.timeEra +
    categoryScores.popularity * weights.popularity +
    categoryScores.languageRegion * weights.languageRegion +
    categoryScores.sound * weights.sound

  const matchReason = generateMatchReason(checklist, categoryScores)

  return {
    track,
    checklist,
    overallScore: Math.round(overallScore),
    categoryScores,
    matchReason,
  }
}

// ==============================
// Helper Functions
// ==============================

function calculateCategoryScore(category: Record<string, boolean>): number {
  const values = Object.values(category)
  const trueCount = values.filter(v => v).length
  return values.length > 0 ? (trueCount / values.length) * 100 : 0
}

function detectVersionMatch(trackName: string, prompt: string): boolean {
  const versions = ['cover', 'remix', 'live', 'acoustic', 'radio edit', 'extended', 'remaster', 'version']
  const trackLower = trackName.toLowerCase()
  const hasVersion = versions.some(v => trackLower.includes(v))
  const promptWantsVersion = versions.some(v => prompt.includes(v))

  if (promptWantsVersion) return hasVersion
  return true // Neutral if not specified
}

function detectEraGenre(prompt: string, intent: PlaylistIntent): boolean {
  const decades = ['60s', '70s', '80s', '90s', '2000s', '2010s', '2020s']
  const eraStyles = ['classic', 'modern', 'vintage', 'contemporary', 'retro', 'new']
  return decades.some(d => prompt.includes(d)) || eraStyles.some(s => prompt.includes(s))
}

function detectMoodMatch(moods: string[], prompt: string): boolean {
  const moodKeywords = ['happy', 'sad', 'romantic', 'angry', 'melancholic', 'joyful', 'dark', 'uplifting']
  return moods.length > 0 || moodKeywords.some(m => prompt.includes(m))
}

function detectEnergyVibe(energy: string, moods: string[]): boolean {
  const energyWords = ['calm', 'hype', 'dreamy', 'intense', 'mellow', 'aggressive', 'peaceful']
  return energy !== undefined || moods.some(m => energyWords.includes(m))
}

function detectValence(moods: string[]): boolean {
  const positiveWords = ['happy', 'joyful', 'uplifting', 'cheerful']
  const negativeWords = ['sad', 'melancholic', 'dark', 'somber']
  return moods.some(m => positiveWords.includes(m) || negativeWords.includes(m))
}

function detectActivity(prompt: string): boolean {
  const activities = ['workout', 'study', 'driving', 'party', 'running', 'gym', 'relax', 'sleep', 'focus', 'dance']
  return activities.some(a => prompt.includes(a))
}

function detectSetting(prompt: string): boolean {
  const settings = ['morning', 'night', 'evening', 'festival', 'road trip', 'beach', 'rain', 'summer', 'winter']
  return settings.some(s => prompt.includes(s))
}

function detectOccasion(prompt: string): boolean {
  const occasions = ['holiday', 'birthday', 'wedding', 'christmas', 'valentine', 'party', 'celebration']
  return occasions.some(o => prompt.includes(o))
}

function matchTempo(audioFeatures: SpotifyAudioFeatures | undefined, prompt: string): boolean {
  if (!audioFeatures) return true // Neutral if no data

  const tempo = audioFeatures.tempo

  // Detect tempo keywords
  if (prompt.includes('fast') || prompt.includes('upbeat')) return tempo > 120
  if (prompt.includes('slow') || prompt.includes('ballad')) return tempo < 100
  if (prompt.includes('medium tempo')) return tempo >= 100 && tempo <= 120

  return true // Default pass if no tempo specified
}

function matchEnergyLevel(
  energy: 'low' | 'medium' | 'high',
  audioFeatures: SpotifyAudioFeatures | undefined
): boolean {
  if (!audioFeatures) return true // Neutral if no data

  const trackEnergy = audioFeatures.energy

  if (energy === 'high') return trackEnergy > 0.7
  if (energy === 'medium') return trackEnergy >= 0.4 && trackEnergy <= 0.7
  if (energy === 'low') return trackEnergy < 0.4

  return true
}

function matchDanceability(
  moods: string[],
  prompt: string,
  audioFeatures: SpotifyAudioFeatures | undefined
): boolean {
  const danceWords = ['dance', 'party', 'club', 'groove', 'bounce']
  const wantsDanceable = danceWords.some(d => prompt.includes(d)) || moods.includes('energetic')

  if (!wantsDanceable) return true // Neutral if not requested

  if (!audioFeatures) return false // Can't verify without data

  return audioFeatures.danceability > 0.6
}

function matchValenceLevel(moods: string[], audioFeatures: SpotifyAudioFeatures | undefined): boolean {
  if (!audioFeatures) return true // Neutral if no data

  const valence = audioFeatures.valence

  const happyMoods = ['happy', 'joyful', 'uplifting', 'cheerful', 'energetic']
  const sadMoods = ['sad', 'melancholic', 'dark', 'somber', 'depressing']

  const wantsHappy = moods.some(m => happyMoods.includes(m))
  const wantsSad = moods.some(m => sadMoods.includes(m))

  if (wantsHappy) return valence > 0.6
  if (wantsSad) return valence < 0.4

  return true // Neutral if no mood specified
}

function matchAcousticness(
  prompt: string,
  keywords: string[],
  audioFeatures: SpotifyAudioFeatures | undefined
): boolean {
  const acousticWords = ['acoustic', 'unplugged', 'stripped']
  const wantsAcoustic = acousticWords.some(a => prompt.includes(a) || (keywords && keywords.includes(a)))

  if (!wantsAcoustic) return true // Neutral if not requested

  if (!audioFeatures) return false // Can't verify without data

  return audioFeatures.acousticness > 0.5
}

function matchInstrumentalness(
  prompt: string,
  keywords: string[],
  audioFeatures: SpotifyAudioFeatures | undefined
): boolean {
  const instrumentalWords = ['instrumental', 'no vocals', 'lo-fi', 'ambient']
  const wantsInstrumental = instrumentalWords.some(i => prompt.includes(i) || (keywords && keywords.includes(i)))

  if (!wantsInstrumental) return true // Neutral if not requested

  if (!audioFeatures) return false // Can't verify without data

  return audioFeatures.instrumentalness > 0.5
}

function matchSpeechiness(
  genres: string[],
  prompt: string,
  audioFeatures: SpotifyAudioFeatures | undefined
): boolean {
  const rapGenres = ['rap', 'hip-hop', 'hip hop', 'spoken word']
  const wantsSpeech = rapGenres.some(g => genres.includes(g) || prompt.includes(g))

  if (!wantsSpeech) return true // Neutral if not requested

  if (!audioFeatures) return false // Can't verify without data

  return audioFeatures.speechiness > 0.33
}

function matchLiveness(prompt: string, audioFeatures: SpotifyAudioFeatures | undefined): boolean {
  const liveWords = ['live', 'concert', 'performance', 'tour']
  const wantsLive = liveWords.some(l => prompt.includes(l))

  if (!wantsLive) return true // Neutral if not requested

  if (!audioFeatures) return false // Can't verify without data

  return audioFeatures.liveness > 0.8
}

function detectDecade(prompt: string): boolean {
  const decades = ['60s', '70s', '80s', '90s', '2000s', '2010s', '2020s', 'sixties', 'seventies', 'eighties', 'nineties']
  return decades.some(d => prompt.includes(d))
}

function detectEraDescriptor(prompt: string, yearFocus: string): boolean {
  const eraWords = ['classic', 'modern', 'vintage', 'contemporary', 'retro', 'new', 'old school']
  return eraWords.some(e => prompt.includes(e)) || yearFocus !== 'mixed'
}

function detectViral(prompt: string, popularity: number): boolean {
  const viralWords = ['viral', 'trending', 'popular', 'hit']
  return viralWords.some(v => prompt.includes(v)) && popularity > 70
}

function detectInstrumentation(prompt: string, keywords: string[]): boolean {
  const instruments = ['guitar', 'piano', 'orchestral', 'electronic', 'synth', 'drums', 'bass', 'strings']
  return instruments.some(i => prompt.includes(i) || keywords.includes(i))
}

function detectSoundDescriptor(prompt: string, keywords: string[]): boolean {
  const sounds = ['lo-fi', 'cinematic', 'ambient', 'heavy', 'distorted', 'chill', 'atmospheric', 'hard']
  return sounds.some(s => prompt.includes(s) || keywords.includes(s))
}

function detectRemixType(trackName: string, prompt: string): boolean {
  const remixTypes = ['remix', 'acoustic', 'dance', 'extended', 'radio', 'club']
  const trackHasRemix = remixTypes.some(r => trackName.toLowerCase().includes(r))
  const promptWantsRemix = remixTypes.some(r => prompt.includes(r))

  if (promptWantsRemix) return trackHasRemix
  return true // Neutral if not specified
}

function generateMatchReason(checklist: TrackMatchChecklist, scores: Record<string, number>): string {
  const reasons: string[] = []

  if (scores.trackInfo > 70) reasons.push('strong track/artist match')
  if (scores.genre > 70) reasons.push('genre alignment')
  if (scores.mood > 70) reasons.push('mood match')
  if (scores.audioFeatures > 70) reasons.push('audio features fit')
  if (scores.timeEra > 70) reasons.push('era match')
  if (scores.popularity > 70) reasons.push('popularity level')

  if (reasons.length === 0) return 'partial match'
  if (reasons.length === 1) return reasons[0]
  if (reasons.length === 2) return reasons.join(' and ')

  const last = reasons.pop()
  return reasons.join(', ') + ', and ' + last
}

/**
 * Filters and sorts tracks by match score
 */
export function rankTracksByMatch(
  tracks: SpotifyTrackWithFeatures[],
  intent: PlaylistIntent,
  prompt: string,
  minScore: number = 30
): TrackMatchScore[] {
  const scored = tracks.map(track => scoreTrackMatch(track, intent, prompt))

  // Apply strict filtering
  return scored
    .filter(s => {
      // Hard requirements (must pass ALL of these)

      // 1. Minimum score threshold
      if (s.overallScore < minScore) return false

      // 2. Artist match (if specific artists were requested)
      if (intent.confirmed_artists && intent.confirmed_artists.length > 0) {
        const trackArtists = s.track.artists.map(a => a.name.toLowerCase())
        const hasArtistMatch = intent.confirmed_artists.some(artist =>
          trackArtists.some(ta => ta.includes(artist.toLowerCase()) || artist.toLowerCase().includes(ta))
        )

        // If artists were specifically requested, track MUST have one of them
        if (!hasArtistMatch) {
          // Exception: allow if genre + mood match is very high (similar artists)
          const genreAndMoodScore = (s.categoryScores.genre + s.categoryScores.mood) / 2
          if (genreAndMoodScore < 80) return false
        }
      }

      // 3. Genre match (strict if genres specified)
      if (intent.genres && intent.genres.length > 0) {
        // Require at least 50% genre score if genres are specified
        if (s.categoryScores.genre < 50) return false
      }

      return true
    })
    .sort((a, b) => b.overallScore - a.overallScore)
}
