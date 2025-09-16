const { BaseTemplateGenerator } = require('./base-template-generator');

/**
 * Use Case Template Generator
 * Responsible for generating use case templates
 */
class UseCaseTemplateGenerator extends BaseTemplateGenerator {
  /**
   * Generate use case template
   * @param {string} featureName - Feature name
   * @param {Object} options - Generation options
   * @returns {string} Generated template content
   */
  generate(featureName, options = {}) {
    const capitalizedName = this.capitalize(featureName);

    return `import { Injectable } from '@nestjs/common';
import { ${capitalizedName}Repository } from '../../domain/repositories/${featureName}.repository';

@Injectable()
export class Create${capitalizedName}UseCase {
  constructor(private readonly ${featureName}Repository: ${capitalizedName}Repository) {}
  async execute(data: any): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
`;
  }
}

module.exports = { UseCaseTemplateGenerator };
