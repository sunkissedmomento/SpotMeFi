export default function BrandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            SpotMefi
          </h1>
          <p className="text-2xl text-gray-300">AI-Powered Playlist Generation</p>
          <p className="text-lg text-gray-400 mt-2">Your vibe, perfectly curated</p>
        </div>

        {/* Brand Identity */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-center">Brand Identity</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-semibold mb-4 text-green-400">Mission</h3>
              <p className="text-gray-300 leading-relaxed">
                SpotMefi revolutionizes music discovery by using advanced AI to understand your mood,
                context, and preferences. We create perfectly tailored playlists that capture exactly
                what you're looking for—no more endless scrolling or generic recommendations.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-semibold mb-4 text-purple-400">Vision</h3>
              <p className="text-gray-300 leading-relaxed">
                To become the most intelligent and intuitive music curation platform, where every
                playlist feels handpicked by someone who truly understands your taste. We believe
                music discovery should be effortless, personal, and deeply satisfying.
              </p>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-center">Color Palette</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-full h-32 bg-gradient-to-br from-gray-800 to-black rounded-xl mb-3 shadow-lg border border-white/10"></div>
              <p className="font-semibold">Deep Black</p>
              <p className="text-sm text-gray-400">#000000</p>
              <p className="text-xs text-gray-500">Primary / Background</p>
            </div>
            <div className="text-center">
              <div className="w-full h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-xl mb-3 shadow-lg shadow-green-500/50"></div>
              <p className="font-semibold">Spotify Green</p>
              <p className="text-sm text-gray-400">#1DB954</p>
              <p className="text-xs text-gray-500">Accent / Energy</p>
            </div>
            <div className="text-center">
              <div className="w-full h-32 bg-white rounded-xl mb-3 shadow-lg border border-gray-300"></div>
              <p className="font-semibold text-gray-900">Pure White</p>
              <p className="text-sm text-gray-400">#FFFFFF</p>
              <p className="text-xs text-gray-500">Text / Contrast</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-center">Typography</h2>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="mb-8">
              <h3 className="text-5xl font-bold mb-2">SpotMefi</h3>
              <p className="text-gray-400">Font: Inter (Bold) - Display/Headlines</p>
            </div>
            <div className="mb-8">
              <h4 className="text-3xl font-semibold mb-2">AI-Powered Playlists</h4>
              <p className="text-gray-400">Font: Inter (Semibold) - Subheadings</p>
            </div>
            <div>
              <p className="text-lg mb-2">
                Create playlists that perfectly match your mood, activity, and musical taste.
                Our advanced AI analyzes your preferences across 10 categories to deliver
                the most accurate recommendations.
              </p>
              <p className="text-gray-400">Font: Inter (Regular) - Body Text</p>
            </div>
          </div>
        </section>

        {/* Logo Variations */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-center">Logo Variations</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-400 via-purple-500 to-pink-500 rounded-2xl p-8 text-center">
              <div className="bg-black/80 backdrop-blur rounded-xl p-6">
                <h3 className="text-4xl font-bold">SpotMefi</h3>
                <p className="text-sm mt-2 text-gray-300">Primary Logo</p>
              </div>
            </div>
            <div className="bg-black rounded-2xl p-8 text-center border-2 border-green-400">
              <div className="p-6">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">
                  SpotMefi
                </h3>
                <p className="text-sm mt-2 text-gray-300">Dark Background</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="p-6">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
                  SpotMefi
                </h3>
                <p className="text-sm mt-2 text-gray-600">Light Background</p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-center">Core Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-900/50 to-green-700/30 rounded-2xl p-6 border border-green-500/30">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">10-Category Matching</h3>
              <p className="text-gray-300 text-sm">
                Advanced AI analyzes tracks across genre, mood, activity, audio features, era,
                and more for perfect matches.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/50 to-purple-700/30 rounded-2xl p-6 border border-purple-500/30">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">Smart Clarification</h3>
              <p className="text-gray-300 text-sm">
                AI asks targeted questions when your prompt is vague, ensuring every playlist
                matches your exact intent.
              </p>
            </div>
            <div className="bg-gradient-to-br from-pink-900/50 to-pink-700/30 rounded-2xl p-6 border border-pink-500/30">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-xl font-bold mb-2">Unlimited Discovery</h3>
              <p className="text-gray-300 text-sm">
                Get ALL matching tracks, not just 30. Discover full discographies and deep cuts
                that fit your vibe.
              </p>
            </div>
          </div>
        </section>

        {/* Brand Voice */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-center">Brand Voice</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-semibold mb-4 text-green-400">We Are</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span><strong>Intelligent:</strong> We understand nuance and context</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span><strong>Personal:</strong> Every playlist feels handcrafted</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span><strong>Effortless:</strong> Simple prompts, perfect results</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span><strong>Passionate:</strong> Music lovers creating for music lovers</span>
                </li>
              </ul>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-semibold mb-4 text-pink-400">We Are Not</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-pink-400 mr-2">✗</span>
                  <span><strong>Generic:</strong> No cookie-cutter algorithms</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-400 mr-2">✗</span>
                  <span><strong>Complicated:</strong> No confusing interfaces</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-400 mr-2">✗</span>
                  <span><strong>Limited:</strong> No arbitrary restrictions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-400 mr-2">✗</span>
                  <span><strong>Impersonal:</strong> No robotic recommendations</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-center">Example Prompts</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-green-900/30 to-transparent rounded-xl p-6 border-l-4 border-green-400">
              <p className="text-lg mb-2">"Create a geiko playlist with melancholic vibes"</p>
              <p className="text-sm text-gray-400">→ 87 tracks, Filipino indie, emotional depth</p>
            </div>
            <div className="bg-gradient-to-r from-purple-900/30 to-transparent rounded-xl p-6 border-l-4 border-purple-400">
              <p className="text-lg mb-2">"2000s workout music, high energy"</p>
              <p className="text-sm text-gray-400">→ 120+ tracks, upbeat, perfect for running</p>
            </div>
            <div className="bg-gradient-to-r from-pink-900/30 to-transparent rounded-xl p-6 border-l-4 border-pink-400">
              <p className="text-lg mb-2">"Study music, lo-fi, instrumental"</p>
              <p className="text-sm text-gray-400">→ Curated focus playlist, no vocals</p>
            </div>
            <div className="bg-gradient-to-r from-blue-900/30 to-transparent rounded-xl p-6 border-l-4 border-blue-400">
              <p className="text-lg mb-2">"Filipino love songs for a road trip"</p>
              <p className="text-sm text-gray-400">→ 60+ OPM tracks, romantic, travel-ready</p>
            </div>
          </div>
        </section>

        {/* Taglines */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-center">Taglines</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-green-500/20 to-purple-500/20 rounded-xl p-6 text-center border border-white/10">
              <p className="text-2xl font-semibold">Your vibe, perfectly curated</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 text-center border border-white/10">
              <p className="text-2xl font-semibold">AI that actually understands your taste</p>
            </div>
            <div className="bg-gradient-to-r from-pink-500/20 to-green-500/20 rounded-xl p-6 text-center border border-white/10">
              <p className="text-2xl font-semibold">From thought to playlist in seconds</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8 text-center">Performance Metrics</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
              <div className="text-4xl font-bold text-green-400 mb-2">87%</div>
              <p className="text-gray-300">Matching Accuracy</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
              <div className="text-4xl font-bold text-purple-400 mb-2">95%</div>
              <p className="text-gray-300">Genre Consistency</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
              <div className="text-4xl font-bold text-pink-400 mb-2">9.1/10</div>
              <p className="text-gray-300">User Satisfaction</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
              <div className="text-4xl font-bold text-blue-400 mb-2">3-5s</div>
              <p className="text-gray-300">Generation Time</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-12 border-t border-white/10">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            SpotMefi
          </h2>
          <p className="text-gray-400">
            AI-Powered Playlist Generation
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Advanced 10-category matching system with Spotify integration
          </p>
        </div>
      </div>
    </div>
  )
}
