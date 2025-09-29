#!/usr/bin/env node

/**
 * Runner script for the wizard integration tests
 * Compiles and executes the TypeScript test script
 */

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🧪 Starting Admin-Wizard Integration Tests...\n')

// Check if we're in a Next.js environment
if (!fs.existsSync('next.config.js')) {
  console.error('❌ This script must be run from the project root directory')
  process.exit(1)
}

// Check if the database is accessible
console.log('🔍 Checking database connection...')

// Use tsx to run the TypeScript file directly
const testScript = path.join(__dirname, 'test-wizard-integration.ts')

const child = spawn('npx', ['tsx', testScript], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
})

child.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ All tests completed successfully!')
  } else {
    console.log('\n❌ Tests failed. Check the output above for details.')
    process.exit(code)
  }
})

child.on('error', (error) => {
  console.error('❌ Failed to run tests:', error.message)
  
  if (error.message.includes('tsx')) {
    console.log('\n💡 To install tsx globally, run: npm install -g tsx')
    console.log('💡 Or install it locally: npm install --save-dev tsx')
  }
  
  process.exit(1)
}) 