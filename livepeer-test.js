// Simple test file to understand the Livepeer SDK structure
const { Livepeer } = require('livepeer');

// Initialize the client with API key
const apiKey = process.env.NEXT_PUBLIC_LIVEPEER_API_KEY;
const livepeer = new Livepeer({ apiKey });

// Log the available methods and properties
console.log('Livepeer SDK Structure:');
console.log('=======================');

// Check top-level methods
console.log('Top-level methods:');
Object.getOwnPropertyNames(Object.getPrototypeOf(livepeer)).forEach(method => {
  if (method !== 'constructor') {
    console.log(`- ${method}`);
  }
});

// Check if specific properties exist
console.log('\nChecking specific properties:');
console.log('- asset exists:', !!livepeer.asset);
if (livepeer.asset) {
  console.log('  Asset methods:');
  Object.getOwnPropertyNames(Object.getPrototypeOf(livepeer.asset)).forEach(method => {
    if (method !== 'constructor') {
      console.log(`  - ${method}`);
    }
  });
}

console.log('- playback exists:', !!livepeer.playback);
if (livepeer.playback) {
  console.log('  Playback methods:');
  Object.getOwnPropertyNames(Object.getPrototypeOf(livepeer.playback)).forEach(method => {
    if (method !== 'constructor') {
      console.log(`  - ${method}`);
    }
  });
}
