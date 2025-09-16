const { IValidator } = require('../core/interfaces');

/**
 * Input Validator
 * Responsible for validating user inputs
 * Single Responsibility: Input validation
 */
class InputValidator extends IValidator {
  constructor() {
    super();
  }

  /**
   * Validate feature name
   * @param {string} featureName - Feature name to validate
   * @returns {boolean} True if valid
   */
  validateFeatureName(featureName) {
    if (!featureName) {
      throw new Error('Feature name is required');
    }

    if (!/^[a-zA-Z0-9-]+$/.test(featureName)) {
      throw new Error(
        'Feature name should only contain letters, numbers, and hyphens',
      );
    }

    return true;
  }

  /**
   * Validate command line arguments
   * @param {string[]} args - Command line arguments
   * @returns {Object} Validated configuration
   */
  validateCommandLineArgs(args) {
    const featureName = args[2];

    if (!featureName) {
      console.error('❌ Error: Feature name is required');
      console.log('Usage: npm run g:feature -- <feature-name>');
      console.log('Example: npm run g:feature -- course');
      process.exit(1);
    }

    try {
      this.validateFeatureName(featureName);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }

    return { featureName };
  }
}

module.exports = { InputValidator };
