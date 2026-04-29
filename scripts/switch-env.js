#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get environment from command line argument
const targetEnv = process.argv[2];

if (!targetEnv || !['development', 'production', 'dev', 'prod'].includes(targetEnv.toLowerCase())) {
  console.log('❌ Usage: node scripts/switch-env.js [development|production|dev|prod]');
  console.log('📋 Examples:');
  console.log('   node scripts/switch-env.js development');
  console.log('   node scripts/switch-env.js production');
  console.log('   node scripts/switch-env.js dev');
  console.log('   node scripts/switch-env.js prod');
  process.exit(1);
}

const env = targetEnv.toLowerCase() === 'dev' ? 'development' : 
           targetEnv.toLowerCase() === 'prod' ? 'production' : targetEnv.toLowerCase();

// Path to .env file
const envPath = path.join(__dirname, '..', '.env');

// Read the target environment file
const sourceEnvPath = path.join(__dirname, '..', `.env.${env}`);

if (!fs.existsSync(sourceEnvPath)) {
  console.log(`❌ Environment file .env.${env} not found!`);
  process.exit(1);
}

// Read source environment file
const sourceContent = fs.readFileSync(sourceEnvPath, 'utf8');

// Write to .env file
fs.writeFileSync(envPath, sourceContent);

console.log(`✅ Environment switched to: ${env}`);
console.log(`📁 Copied .env.${env} to .env`);
console.log(`🔗 API URL: ${sourceContent.split('\n').find(line => line.startsWith('REACT_APP_API_URL'))?.split('=')[1]}`);
console.log(`\n🚀 Run 'npm start' to apply the new environment`);
