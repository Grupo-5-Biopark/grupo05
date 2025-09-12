const { BaseTemplateGenerator } = require('./base-template-generator');

/**
 * Entity Template Generator
 * Responsible for generating domain entity templates
 */
class EntityTemplateGenerator extends BaseTemplateGenerator {
  /**
   * Generate domain entity template
   * @param {string} featureName - Feature name
   * @param {Object} options - Generation options
   * @returns {string} Generated template content
   */
  generate(featureName, options = {}) {
    const capitalizedName = this.capitalize(featureName);

    return `import { randomUUID } from 'crypto';

export class ${capitalizedName} {
  public readonly id: string;

  constructor() {
    this.id = randomUUID();
    // Add other properties to be passed into the constructor as needed
  }
}
`;
  }
}

module.exports = { EntityTemplateGenerator };
