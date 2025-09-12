#!/usr/bin/env node

/**
 * Refactored Feature Generator Script
 *
 * This script follows SOLID principles:
 * - Single Responsibility: Each class has one reason to change
 * - Open/Closed: Easy to extend with new generators without modifying existing code
 * - Liskov Substitution: All implementations can be substituted with their interfaces
 * - Interface Segregation: Small, focused interfaces
 * - Dependency Inversion: Depends on abstractions, not concretions
 */

const { InputValidator } = require('./feature-generator/core/input-validator');
const {
  FeatureGeneratorOrchestrator,
} = require('./feature-generator/core/feature-generator-orchestrator');

/**
 * Main application entry point
 */
class FeatureGeneratorApp {
  constructor() {
    this.validator = new InputValidator();
    this.orchestrator = new FeatureGeneratorOrchestrator();
  }

  /**
   * Run the feature generator application
   */
  async run() {
    try {
      // Validate input
      const { featureName } = this.validator.validateCommandLineArgs(
        process.argv,
      );

      // Generate feature
      await this.orchestrator.generateFeature(featureName);
    } catch (error) {
      console.error('❌ Application error:', error.message);
      process.exit(1);
    }
  }
}

// Run the application
const app = new FeatureGeneratorApp();
app.run();
