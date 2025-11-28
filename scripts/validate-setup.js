#!/usr/bin/env node

/**
 * Setup Validation Script
 * Checks that all required environment variables are configured
 */

const fs = require('fs')
const path = require('path')

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SECRET_KEY',
  'SPOTIFY_CLIENT_ID',
  'SPOTIFY_CLIENT_SECRET',
  'NEXT_PUBLIC_REDIRECT_URI',
  'ANTHROPIC_API_KEY',
  'NEXT_PUBLIC_APP_URL',
]

console.log('🔍 Validating SpotMefi setup...\n')

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!')
  console.log('📝 Run: cp .env.local.example .env.local')
  console.log('   Then fill in your values\n')
  process.exit(1)
}

// Read .env.local
const envContent = fs.readFileSync(envPath, 'utf-8')
const envLines = envContent.split('\n')

// Parse environment variables
const envVars = {}
envLines.forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=')
    const value = valueParts.join('=').trim()
    if (key && value) {
      envVars[key] = value
    }
  }
})

// Validate each required variable
let allValid = true
const issues = []

requiredEnvVars.forEach(varName => {
  const value = envVars[varName]

  if (!value) {
    allValid = false
    issues.push(`❌ ${varName} is not set`)
  } else if (value.includes('your_') || value.includes('xxxxx')) {
    allValid = false
    issues.push(`⚠️  ${varName} has placeholder value: ${value}`)
  } else {
    console.log(`✅ ${varName}`)
  }
})

console.log('')

if (!allValid) {
  console.log('Issues found:\n')
  issues.forEach(issue => console.log(issue))
  console.log('\n📚 See QUICKSTART.md for setup instructions\n')
  process.exit(1)
}

// Additional validation
console.log('🔍 Running additional checks...\n')

// Check Supabase URL format
const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL']
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.log('⚠️  NEXT_PUBLIC_SUPABASE_URL format looks incorrect')
  console.log('   Expected: https://xxxxx.supabase.co\n')
}

// Check redirect URI
const redirectUri = envVars['NEXT_PUBLIC_REDIRECT_URI']
if (!redirectUri.includes('/api/auth/callback')) {
  console.log('⚠️  NEXT_PUBLIC_REDIRECT_URI should end with /api/auth/callback\n')
}

// Check app URL
const appUrl = envVars['NEXT_PUBLIC_APP_URL']
if (appUrl !== 'http://localhost:3000' && !appUrl.startsWith('https://')) {
  console.log('⚠️  NEXT_PUBLIC_APP_URL should be http://localhost:3000 for dev\n')
  console.log('   or https:// for production\n')
}

console.log('✨ Setup validation complete!\n')
console.log('Next steps:')
console.log('1. Run: npm install')
console.log('2. Run: npm run dev')
console.log('3. Visit: http://localhost:3000\n')
console.log('📚 See QUICKSTART.md for more details\n')
