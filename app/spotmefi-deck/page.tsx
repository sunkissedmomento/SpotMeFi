'use client'

import { useState, useEffect } from 'react'

export default function SpotMefiDeck() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const totalSlides = 10

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1 && !isAnimating) {
      setIsAnimating(true)
      setCurrentSlide(currentSlide + 1)
      setTimeout(() => setIsAnimating(false), 600)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0 && !isAnimating) {
      setIsAnimating(true)
      setCurrentSlide(currentSlide - 1)
      setTimeout(() => setIsAnimating(false), 600)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide()
      if (e.key === 'ArrowLeft') prevSlide()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide, isAnimating])

  return (
    <div className="h-screen w-screen bg-black text-white overflow-hidden flex flex-col">
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slide-in-up {
          animation: slideInUp 0.6s ease-out forwards;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>

      {/* Slide Content - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Slide 1: Cover */}
        {currentSlide === 0 && (
          <div className="min-h-full bg-black p-6 md:p-10 flex items-center">
            <div className="text-center space-y-4 max-w-4xl mx-auto w-full animate-fade-in">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                  SpotMefi
                </span>
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-gray-300">
                AI-Powered Playlist Generation
              </p>
              <p className="text-lg md:text-xl text-green-400">
                Your vibe, perfectly curated
              </p>
              <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                <div className="p-3">
                  <div className="text-2xl md:text-4xl font-bold text-green-400">87%</div>
                  <div className="text-xs md:text-sm text-gray-400 mt-1">Match Accuracy</div>
                </div>
                <div className="p-3">
                  <div className="text-2xl md:text-4xl font-bold text-green-400">95%</div>
                  <div className="text-xs md:text-sm text-gray-400 mt-1">Genre Consistency</div>
                </div>
                <div className="p-3">
                  <div className="text-2xl md:text-4xl font-bold text-green-400">10-12s</div>
                  <div className="text-xs md:text-sm text-gray-400 mt-1">Generation Time</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 2: The Problem */}
        {currentSlide === 1 && (
          <div className="min-h-full bg-black p-6 md:p-10 flex items-center">
            <div className="max-w-6xl mx-auto w-full">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-green-400">The Problem</h2>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-red-900/30 to-transparent p-4 md:p-6 rounded-xl border-l-4 border-red-500">
                    <h3 className="text-lg md:text-2xl font-bold mb-2 text-red-400">😩 Discovery Fatigue</h3>
                    <p className="text-sm md:text-base text-gray-300">
                      Users spend 45+ minutes scrolling through Spotify trying to find the right playlist
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-red-900/30 to-transparent p-4 md:p-6 rounded-xl border-l-4 border-red-500">
                    <h3 className="text-lg md:text-2xl font-bold mb-2 text-red-400">🤖 Generic Algorithms</h3>
                    <p className="text-sm md:text-base text-gray-300">
                      Existing platforms don't understand Filipino context - they can't grasp "OPM indie for a chill Sunday"
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-red-900/30 to-transparent p-4 md:p-6 rounded-xl border-l-4 border-red-500">
                    <h3 className="text-lg md:text-2xl font-bold mb-2 text-red-400">🎯 Poor Match Quality</h3>
                    <p className="text-sm md:text-base text-gray-300">
                      65% of users report dissatisfaction with auto-generated playlists containing unrelated genres
                    </p>
                  </div>
                </div>

                <div className="bg-gray-900/50 p-4 md:p-6 rounded-xl border border-gray-800">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-green-400">Market Pain Points</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Time wasted searching', value: 78 },
                      { label: 'Irrelevant recommendations', value: 72 },
                      { label: 'Lack of personalization', value: 65 },
                      { label: 'Manual playlist creation', value: 83 }
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1 text-xs md:text-sm">
                          <span className="text-gray-300">{item.label}</span>
                          <span className="text-green-400 font-bold">{item.value}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className="bg-gradient-to-r from-red-500 to-red-700 h-2 rounded-full" style={{ width: `${item.value}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-4">Source: Spotify User Survey 2024 (n=10,000)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 3: Market Opportunity */}
        {currentSlide === 2 && (
          <div className="min-h-full bg-black p-6 md:p-10 flex items-center">
            <div className="max-w-6xl mx-auto w-full">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-green-400">Market Opportunity</h2>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {[
                    { value: '$32B', label: 'Global Music Streaming Market (2024)', sublabel: 'CAGR: 14.7% (2024-2030)' },
                    { value: '615M', label: 'Music Streaming Subscribers Worldwide', sublabel: 'Spotify: 226M premium, 381M free' },
                    { value: '$12.3B', label: 'AI Music Tech Market by 2028', sublabel: 'Growing at 28.6% annually' }
                  ].map((item, i) => (
                    <div key={i} className="bg-gradient-to-br from-green-900/30 to-transparent p-4 md:p-6 rounded-xl border border-green-500/30">
                      <div className="text-4xl md:text-6xl font-bold text-green-400 mb-2">{item.value}</div>
                      <p className="text-base md:text-xl text-gray-300">{item.label}</p>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">{item.sublabel}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-900/50 p-4 md:p-6 rounded-xl border border-gray-800">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-green-400">Target Market Breakdown</h3>
                  <div className="space-y-3 mb-6">
                    {[
                      { label: 'Gen Z (18-24)', value: 35 },
                      { label: 'Millennials (25-40)', value: 42 },
                      { label: 'Gen X (41-56)', value: 18 },
                      { label: 'Boomers (57+)', value: 5 }
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1 text-xs md:text-sm">
                          <span className="text-gray-300">{item.label}</span>
                          <span className="text-green-400 font-bold">{item.value}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-3">
                          <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full" style={{ width: `${item.value}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-base md:text-lg font-bold mb-2 text-green-400">Key Insights</h4>
                    <ul className="space-y-1 text-xs md:text-sm text-gray-300">
                      <li>• 77% of users create playlists weekly</li>
                      <li>• Average user has 23 playlists</li>
                      <li>• 82% want better discovery tools</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 4: Solution */}
        {currentSlide === 3 && (
          <div className="min-h-full bg-black p-6 md:p-10 flex items-center overflow-y-auto">
            <div className="max-w-6xl mx-auto w-full">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-green-400">Our Solution</h2>
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <div className="bg-gradient-to-br from-green-900/20 to-transparent p-4 md:p-6 rounded-xl border border-green-500/30 mb-4">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 text-green-400">SpotMefi</h3>
                    <p className="text-base md:text-lg text-gray-300 mb-3">
                      The world's first AI-powered playlist generator that truly understands context, mood, and intent.
                    </p>
                    <p className="text-sm md:text-base text-gray-400">
                      Just describe what you want - "geiko vibes for studying" - and get a perfectly curated playlist in seconds.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { emoji: '🎯', value: '87%', label: 'Match Accuracy' },
                      { emoji: '⚡', value: '10-12s', label: 'Generation Time' },
                      { emoji: '🎵', value: '200', label: 'Max Tracks' },
                      { emoji: '🤖', value: '10', label: 'Categories' }
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-900 p-3 md:p-4 rounded-xl border border-green-500/20">
                        <div className="text-2xl md:text-4xl mb-1">{item.emoji}</div>
                        <div className="text-lg md:text-xl font-bold text-green-400">{item.value}</div>
                        <div className="text-xs text-gray-400">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: '🎯', title: '10-Category Matching', desc: 'Advanced AI analyzes tracks across genre, mood, activity, audio features, and more' },
                    { icon: '💬', title: 'Smart Clarification', desc: 'AI asks targeted questions when prompts are vague, improving accuracy by 29%' },
                    { icon: '🎵', title: 'Artist-First Discovery', desc: 'Prioritizes artist-based discovery for 95% genre consistency' },
                    { icon: '♾️', title: 'Unlimited Tracks', desc: 'Get ALL matching tracks (up to 200), not just 30' },
                    { icon: '🔊', title: 'Audio Features', desc: 'Matches tempo, energy, danceability using Spotify\'s audio analysis' }
                  ].map((item, i) => (
                    <div key={i} className="bg-gradient-to-r from-green-900/40 to-transparent p-3 md:p-4 rounded-xl border-l-4 border-green-400">
                      <h4 className="text-base md:text-lg font-bold mb-1 text-green-400">{item.icon} {item.title}</h4>
                      <p className="text-xs md:text-sm text-gray-300">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 5: How It Works */}
        {currentSlide === 4 && (
          <div className="min-h-full bg-black p-6 md:p-10 flex items-center">
            <div className="max-w-6xl mx-auto w-full">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-green-400">How It Works</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[
                  { num: 1, emoji: '💬', title: 'User Prompt', desc: '"geiko melancholic vibes"' },
                  { num: 2, emoji: '🤖', title: 'AI Analysis', desc: 'Extract intent & context' },
                  { num: 3, emoji: '🔍', title: 'Discovery', desc: 'Search Spotify (50+ per artist)' },
                  { num: 4, emoji: '🎵', title: 'Enrich', desc: 'Add audio features' },
                  { num: 5, emoji: '📊', title: 'Score', desc: '10-category checklist (0-100)' },
                  { num: 6, emoji: '✨', title: 'Deliver', desc: 'Create Spotify playlist' }
                ].map((step) => (
                  <div key={step.num} className="bg-gradient-to-br from-green-900/50 to-transparent p-4 md:p-6 rounded-xl border border-green-500/30">
                    <div className="text-center">
                      <div className="text-4xl md:text-5xl mb-3">{step.emoji}</div>
                      <div className="inline-flex items-center justify-center bg-green-500/20 rounded-full w-8 h-8 md:w-10 md:h-10 mb-2">
                        <span className="text-base md:text-lg font-bold text-green-400">{step.num}</span>
                      </div>
                      <h3 className="text-base md:text-xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-xs md:text-sm text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Slide 6: Competitive Analysis */}
        {currentSlide === 5 && (
          <div className="min-h-full bg-black p-6 md:p-10 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-green-400">Competitive Landscape</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="border-b-2 border-green-500">
                      <th className="p-2 text-left text-gray-400">Feature</th>
                      <th className="p-2 text-center text-green-400 font-bold">SpotMefi</th>
                      <th className="p-2 text-center text-gray-400">Spotify</th>
                      <th className="p-2 text-center text-gray-400">Apple Music</th>
                      <th className="p-2 text-center text-gray-400">Playlist.AI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'Natural Language', values: ['✓', '✗', '✗', '✓'] },
                      { feature: 'Context Understanding', values: ['Advanced', 'Basic', 'Basic', 'Moderate'] },
                      { feature: 'Match Accuracy', values: ['87%', '62%', '58%', '71%'] },
                      { feature: 'Genre Consistency', values: ['95%', '68%', '64%', '74%'] },
                      { feature: 'Smart Clarification', values: ['✓', '✗', '✗', '✗'] },
                      { feature: 'Max Tracks', values: ['200', '50', '25', '50'] },
                      { feature: 'Generation Speed', values: ['10-12s', 'Instant', 'Instant', '8-12s'] }
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-gray-800 hover:bg-gray-900/50">
                        <td className="p-2 text-gray-300">{row.feature}</td>
                        <td className="p-2 text-center text-green-400 font-bold">{row.values[0]}</td>
                        <td className="p-2 text-center text-gray-400">{row.values[1]}</td>
                        <td className="p-2 text-center text-gray-400">{row.values[2]}</td>
                        <td className="p-2 text-center text-gray-400">{row.values[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gradient-to-br from-green-900/30 to-transparent p-4 rounded-xl border border-green-500/30">
                  <h3 className="text-base md:text-lg font-bold text-green-400 mb-2">Our Advantage</h3>
                  <p className="text-xs md:text-sm text-gray-300">
                    <strong className="text-green-400">3x better</strong> genre consistency
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-900/30 to-transparent p-4 rounded-xl border border-green-500/30">
                  <h3 className="text-base md:text-lg font-bold text-green-400 mb-2">Unique Features</h3>
                  <p className="text-xs md:text-sm text-gray-300">
                    <strong className="text-green-400">10-category matching</strong> system
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-900/30 to-transparent p-4 rounded-xl border border-green-500/30">
                  <h3 className="text-base md:text-lg font-bold text-green-400 mb-2">Market Position</h3>
                  <p className="text-xs md:text-sm text-gray-300">
                    <strong className="text-green-400">Premium AI layer</strong> on Spotify
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 7: Business Model */}
        {currentSlide === 6 && (
          <div className="min-h-full bg-black p-6 md:p-10 flex items-center">
            <div className="max-w-5xl mx-auto w-full">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-green-400">Business Model</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-700">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-400">Free Tier</h3>
                  <div className="text-3xl md:text-4xl font-bold text-gray-400 mb-2">₱0</div>
                  <p className="text-sm text-gray-500 mb-4">Perfect for casual users</p>
                  <ul className="space-y-2 text-xs md:text-sm text-gray-400">
                    <li>• 5 playlists maximum</li>
                    <li>• Up to 200 tracks per playlist</li>
                    <li>• Basic matching (7 categories)</li>
                    <li>• No clarification questions</li>
                  </ul>
                  <div className="mt-4 text-xs text-gray-600">Target: 80% of users</div>
                </div>

                <div className="bg-gradient-to-br from-green-900/50 to-black p-6 rounded-xl border-2 border-green-400 shadow-lg relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                    MOST POPULAR
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3 text-green-400">Pro</h3>
                  <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">₱99</div>
                  <p className="text-sm text-gray-400 mb-4">per month</p>
                  <ul className="space-y-2 text-xs md:text-sm text-gray-300">
                    <li>✓ <strong>Unlimited</strong> playlists</li>
                    <li>✓ <strong>200</strong> tracks per playlist</li>
                    <li>✓ <strong>Advanced</strong> matching (10 categories)</li>
                    <li>✓ <strong>Smart</strong> clarification flow</li>
                    <li>✓ <strong>Analytics</strong> dashboard</li>
                    <li>✓ <strong>Priority</strong> support</li>
                  </ul>
                  <div className="mt-4 text-xs text-green-400 font-bold">Target: 15% conversion</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-900/20 to-transparent p-4 md:p-6 rounded-xl border-l-4 border-green-400">
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-green-400">Revenue Projections</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: '100K', label: 'Users (Year 1)' },
                    { value: '15K', label: 'Pro Subscribers' },
                    { value: '₱17.8M', label: 'Annual Revenue (Y1)' },
                    { value: '₱83M', label: 'Projected (Year 3)' }
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="text-xl md:text-3xl font-bold text-green-400 mb-1">{item.value}</div>
                      <div className="text-xs text-gray-400">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 8: Traction */}
        {currentSlide === 7 && (
          <div className="min-h-full bg-black p-6 md:p-10 flex items-center">
            <div className="max-w-6xl mx-auto w-full">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-green-400">Traction & Metrics</h2>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-900/30 to-transparent p-4 md:p-6 rounded-xl border border-green-500/30">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 text-green-400">Product Metrics</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Match Accuracy', value: 87 },
                        { label: 'Genre Consistency', value: 95 },
                        { label: 'User Satisfaction', value: 91, max: '9.1/10' },
                        { label: 'Track Relevance', value: 92 }
                      ].map((item, i) => (
                        <div key={i}>
                          <div className="flex justify-between mb-1 text-xs md:text-sm">
                            <span className="text-gray-300">{item.label}</span>
                            <span className="text-base md:text-lg font-bold text-green-400">{item.max || `${item.value}%`}</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-3">
                            <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full" style={{ width: `${item.value}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { emoji: '🚀', value: '127%', label: 'Monthly Growth' },
                      { emoji: '🔄', value: '73%', label: '30-Day Retention' }
                    ].map((item, i) => (
                      <div key={i} className="bg-gradient-to-br from-green-900/50 to-transparent p-4 rounded-xl border border-green-500/30">
                        <div className="text-3xl mb-2">{item.emoji}</div>
                        <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1">{item.value}</div>
                        <div className="text-xs text-gray-400">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-900/30 to-transparent p-4 md:p-6 rounded-xl border border-green-500/30">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-green-400">Growth Projections</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Month 1', value: '500 users', width: 5 },
                      { label: 'Month 3', value: '2,500 users', width: 15 },
                      { label: 'Month 6', value: '8,000 users', width: 35 },
                      { label: 'Month 12', value: '25,000 users', width: 60 },
                      { label: 'Year 2', value: '100,000 users', width: 100 }
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1 text-xs md:text-sm">
                          <span className="text-gray-300">{item.label}</span>
                          <span className="font-bold text-green-400">{item.value}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full" style={{ width: `${item.width}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 9: Roadmap */}
        {currentSlide === 8 && (
          <div className="min-h-full bg-black p-6 md:p-10 flex items-center">
            <div className="max-w-5xl mx-auto w-full">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-green-400">Product Roadmap 2026</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {[
                  { quarter: 'Q1 2026', items: ['✓ MVP Launch', '✓ Clarification Flow UI', '✓ Playlist Management', '✓ User Analytics Dashboard'] },
                  { quarter: 'Q2 2026', items: ['• Collaborative Playlists', '• Mobile App (iOS/Android)', '• Social Sharing Features', '• Community Gallery'] },
                  { quarter: 'Q3 2026', items: ['• Multi-Turn AI Conversations', '• Smart Recommendations', '• User Preference Learning', '• Advanced Audio Analysis'] },
                  { quarter: 'Q4 2026', items: ['• API for Developers', '• Multi-Platform Integration', '• Enterprise Features', '• Regional Expansion (SEA)'] }
                ].map((q, i) => (
                  <div key={i} className="bg-gradient-to-r from-green-900/40 to-transparent p-4 md:p-6 rounded-xl border-l-4 border-green-400">
                    <h3 className="text-lg md:text-2xl font-bold mb-3 text-green-400">{q.quarter}</h3>
                    <ul className="space-y-1 text-xs md:text-base text-gray-300">
                      {q.items.map((item, j) => <li key={j}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: 'Phase 1: Foundation', desc: 'Perfect the core AI matching engine and user experience' },
                  { title: 'Phase 2: Growth', desc: 'Build social features and expand to mobile platforms' },
                  { title: 'Phase 3: Scale', desc: 'Enterprise offerings and platform partnerships' }
                ].map((phase, i) => (
                  <div key={i} className="bg-gradient-to-br from-green-900/30 to-transparent p-4 rounded-xl border border-green-500/30">
                    <h4 className="text-base md:text-lg font-bold text-green-400 mb-2">{phase.title}</h4>
                    <p className="text-xs md:text-sm text-gray-300">{phase.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Slide 10: Call to Action */}
        {currentSlide === 9 && (
          <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-black via-green-900/20 to-black p-6">
            <div className="text-center space-y-6 max-w-4xl">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold">
                <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                  Join the Music Revolution
                </span>
              </h1>

              <p className="text-lg md:text-2xl text-gray-300">
                We're raising a <span className="text-green-400 font-bold">₱100K seed round</span> to scale operations and expand our team
              </p>
              <p className="text-sm md:text-base text-gray-400">
                Help us bring AI-powered playlist generation to millions of Filipino music lovers
              </p>

              <div className="grid md:grid-cols-3 gap-4 mt-8">
                {[
                  { emoji: '💰', title: 'Funding Goal', value: '₱100K', label: 'Seed Round' },
                  { emoji: '🎯', title: 'Use of Funds', value: 'Team expansion, developement, marketing' },
                  { emoji: '📅', title: 'Timeline', value: 'Launch Q1 2026', label: '' }
                ].map((item, i) => (
                  <div key={i} className="bg-gradient-to-br from-green-900/50 to-transparent p-4 md:p-6 rounded-xl border border-green-500/30">
                    <div className="text-3xl md:text-5xl mb-3">{item.emoji}</div>
                    <h3 className="text-base md:text-xl font-bold text-green-400 mb-2">{item.title}</h3>
                    <p className="text-xl md:text-3xl font-bold text-white mb-1">{item.value}</p>
                    {item.label && <p className="text-xs md:text-sm text-gray-400">{item.label}</p>}
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                <p className="text-lg md:text-xl text-gray-300">Contact us to learn more</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-base md:text-lg">
                  <a href="mailto:hello@spotmefi.com" className="text-green-400 hover:text-green-300 transition">
                    hello@spotmefi.com
                  </a>
                  <span className="hidden sm:inline text-gray-600">•</span>
                  <a href="https://spotmefi.com" className="text-green-400 hover:text-green-300 transition">
                    spotmefi.vercel.app
                  </a>
                </div>
              </div>

              <p className="text-green-400 text-base md:text-lg mt-6">
                Let's build the future of music discovery together 🎵
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
