const path = require('path');
const { IConfigurationManager } = require('../core/interfaces');

/**
 * Configuration Manager
 * Responsible for managing project configuration and paths
 * Single Responsibility: Configuration management
 */
class ConfigurationManager extends IConfigurationManager {
  constructor() {
    super();
    this.projectRoot = process.cwd();
  }

  /**
   * Get project paths configuration
   * @returns {Object} Configuration object with paths
   */
  getProjectPaths() {
    return {
      root: this.projectRoot,
      server: path.join(this.projectRoot, 'apps', 'server', 'src'),
      sharedTypes: path.join(
        this.projectRoot,
        'packages',
        'shared-types',
        'src',
      ),
      modules: path.join(this.projectRoot, 'apps', 'server', 'src', 'modules'),
    };
  }

  /**
   * Get DDD directory structure for a feature
   * @param {string} featureName - Feature name
   * @returns {string[]} Array of directory paths
   */
  getDDDDirectories(featureName) {
    const paths = this.getProjectPaths();
    const basePath = path.join(paths.modules, featureName);

    return [
      path.join(basePath, 'domain', 'entities'),
      path.join(basePath, 'domain', 'repositories'),
      path.join(basePath, 'domain', 'services'),
      path.join(basePath, 'infrastructure'),
      path.join(basePath, 'infrastructure', 'repositories'),
      path.join(basePath, 'infrastructure', 'adapters'),
      path.join(basePath, 'application', 'dtos'),
      path.join(basePath, 'application', 'use-cases'),
      paths.sharedTypes,
    ];
  }

  /**
   * Get file paths for DDD structure
   * @param {string} featureName - Feature name
   * @returns {Object} Object with file paths for each layer
   */
  getFeatureFilePaths(featureName) {
    const paths = this.getProjectPaths();
    const basePath = path.join(paths.modules, featureName);

    return {
      sharedDto: path.join(paths.sharedTypes, `${featureName}.dto.ts`),
      backendDto: path.join(
        basePath,
        'application',
        'dtos',
        `${featureName}.dto.ts`,
      ),
      entity: path.join(
        basePath,
        'domain',
        'entities',
        `${featureName}.entity.ts`,
      ),
      repositoryInterface: path.join(
        basePath,
        'domain',
        'repositories',
        `${featureName}.repository.ts`,
      ),
      repositoryImplementation: path.join(
        basePath,
        'infrastructure',
        'repositories',
        `${featureName}.repository.impl.ts`,
      ),
      useCase: path.join(
        basePath,
        'application',
        'use-cases',
        `${featureName}.use-cases.ts`,
      ),
      barrelFile: path.join(paths.sharedTypes, 'index.ts'),
    };
  }

  /**
   * Get NestJS generation paths
   * @param {string} featureName - Feature name
   * @returns {Object} Object with NestJS CLI paths
   */
  getNestJSPaths(featureName) {
    return {
      module: `modules/${featureName}`,
      controller: `modules/${featureName}/application/${featureName}`,
    };
  }

  /**
   * Get project configuration
   * @returns {Object} Project configuration
   */
  getProjectConfig() {
    return {
      defaultProject: 'server',
      moduleDirectory: 'modules',
    };
  }
}

module.exports = { ConfigurationManager };
