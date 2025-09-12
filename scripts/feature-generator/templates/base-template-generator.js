const { ITemplateGenerator } = require('../core/interfaces');

/**
 * Base template generator with common functionality
 */
class BaseTemplateGenerator extends ITemplateGenerator {
  constructor() {
    super();
  }

  /**
   * Capitalize first letter of a string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Convert string to lowercase
   * @param {string} str - String to convert
   * @returns {string} Lowercase string
   */
  toLowerCase(str) {
    return str.toLowerCase();
  }
}

module.exports = { BaseTemplateGenerator };
