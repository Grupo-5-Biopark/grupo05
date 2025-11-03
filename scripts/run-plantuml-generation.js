#!/usr/bin/env node

/**
 * Cross-platform script to run PlantUML generation
 * This script is called by lint-staged when entity files are modified
 * It runs both individual and combined PlantUML diagram generation
 */

const { execSync } = require('child_process');
const path = require('path');

// Get the root directory of the monorepo
const rootDir = path.resolve(__dirname, '..');
const scriptsDir = __dirname;

try {
  console.log('Generating individual PlantUML diagrams...');

  // Run the individual PlantUML generation script
  execSync('node generate-plantuml.js', {
    cwd: scriptsDir,
    stdio: 'inherit',
    encoding: 'utf-8',
  });

  console.log('Generating combined PlantUML diagram...');

  // Run the combined PlantUML generation script
  execSync('node generate-plantuml-combined.js', {
    cwd: scriptsDir,
    stdio: 'inherit',
    encoding: 'utf-8',
  });

  console.log('PlantUML diagrams generated successfully!');
  process.exit(0);
} catch (error) {
  console.error('Error generating PlantUML diagrams:', error.message);
  process.exit(1);
}
