const { BaseTemplateGenerator } = require('./base-template-generator');

/**
 * Module Template Generator
 * Responsible for generating NestJS module templates with proper controller registration
 */
class ModuleTemplateGenerator extends BaseTemplateGenerator {
  /**
   * Generate module template with controller registration
   * @param {string} featureName - Feature name
   * @param {Object} options - Generation options
   * @returns {string} Generated module template
   */
  generate(featureName, options = {}) {
    const capitalizedName = this.capitalize(featureName);

    return `import { Module } from '@nestjs/common';
import { ${capitalizedName}Controller } from './application/${featureName}.controller';

@Module({
  controllers: [${capitalizedName}Controller],
  providers: [
    // TODO: Add your use cases and repositories here
    // Create${capitalizedName}UseCase,
    // Find${capitalizedName}UseCase,
    // Update${capitalizedName}UseCase,
    // Delete${capitalizedName}UseCase,
    // {
    //   provide: '${capitalizedName}Repository',
    //   useClass: ${capitalizedName}RepositoryImpl,
    // },
  ],
  exports: [
    // TODO: Export services that other modules might need
  ],
})
export class ${capitalizedName}Module {}
`;
  }
}

module.exports = { ModuleTemplateGenerator };
