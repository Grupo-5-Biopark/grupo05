const { BaseTemplateGenerator } = require('./base-template-generator');

/**
 * DTO Template Generator
 * Responsible for generating DTO templates (both shared and backend DTOs)
 */
class DTOTemplateGenerator extends BaseTemplateGenerator {
  /**
   * Generate shared DTO template for frontend-backend contract
   * @param {string} featureName - Feature name
   * @param {Object} options - Generation options
   * @returns {string} Generated template content
   */
  generateSharedDTO(featureName, options = {}) {
    const capitalizedName = this.capitalize(featureName);

    return `export interface Create${capitalizedName}Dto {
  name: string;
}
export type Update${capitalizedName}Dto = Partial<Create${capitalizedName}Dto>;
`;
  }

  /**
   * Generate backend DTO template with validation
   * @param {string} featureName - Feature name
   * @param {Object} options - Generation options
   * @returns {string} Generated template content
   */
  generateBackendDTO(featureName, options = {}) {
    const capitalizedName = this.capitalize(featureName);

    return `import { IsString, IsNotEmpty } from 'class-validator';
import { Create${capitalizedName}Dto as ICreate${capitalizedName}Dto } from 'shared-types';
import { PartialType } from '@nestjs/mapped-types';

export class Create${capitalizedName}Dto implements ICreate${capitalizedName}Dto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
export class Update${capitalizedName}Dto extends PartialType(Create${capitalizedName}Dto) {}
`;
  }

  /**
   * Main generate method (implements interface)
   * @param {string} featureName - Feature name
   * @param {Object} options - Generation options
   * @returns {Object} Object with both DTO templates
   */
  generate(featureName, options = {}) {
    return {
      shared: this.generateSharedDTO(featureName, options),
      backend: this.generateBackendDTO(featureName, options),
    };
  }
}

module.exports = { DTOTemplateGenerator };
