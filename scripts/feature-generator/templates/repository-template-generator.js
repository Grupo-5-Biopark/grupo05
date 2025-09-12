const { BaseTemplateGenerator } = require('./base-template-generator');

/**
 * Repository Template Generator
 * Responsible for generating repository interface and implementation templates
 */
class RepositoryTemplateGenerator extends BaseTemplateGenerator {
  /**
   * Generate repository interface template
   * @param {string} featureName - Feature name
   * @param {Object} options - Generation options
   * @returns {string} Generated template content
   */
  generateInterface(featureName, options = {}) {
    const capitalizedName = this.capitalize(featureName);
    const lowerCaseName = this.toLowerCase(featureName);

    return `import { ${capitalizedName} } from '../entities/${featureName}.entity';

export interface ${capitalizedName}Repository {
  findById(id: string): Promise<${capitalizedName} | null>;
  save(${lowerCaseName}: ${capitalizedName}): Promise<void>;
}
`;
  }

  /**
   * Generate repository implementation template
   * @param {string} featureName - Feature name
   * @param {Object} options - Generation options
   * @returns {string} Generated template content
   */
  generateImplementation(featureName, options = {}) {
    const capitalizedName = this.capitalize(featureName);
    const lowerCaseName = this.toLowerCase(featureName);

    return `import { Injectable } from '@nestjs/common';
import { ${capitalizedName} } from '../../domain/entities/${featureName}.entity';
import { ${capitalizedName}Repository } from '../../domain/repositories/${featureName}.repository';

@Injectable()
export class ${capitalizedName}RepositoryImpl implements ${capitalizedName}Repository {
  async findById(id: string): Promise<${capitalizedName} | null> {
    throw new Error('Method not implemented.');
  }
  async save(${lowerCaseName}: ${capitalizedName}): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
`;
  }

  /**
   * Main generate method (implements interface)
   * @param {string} featureName - Feature name
   * @param {Object} options - Generation options
   * @returns {Object} Object with both repository templates
   */
  generate(featureName, options = {}) {
    return {
      interface: this.generateInterface(featureName, options),
      implementation: this.generateImplementation(featureName, options),
    };
  }
}

module.exports = { RepositoryTemplateGenerator };
