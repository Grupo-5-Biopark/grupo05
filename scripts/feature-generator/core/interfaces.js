/**
 * Interface definitions for the feature generator
 * Following SOLID principles for better maintainability
 */

/**
 * Interface for template generators
 */
class ITemplateGenerator {
  /**
   * Generate template content for a specific feature
   * @param {string} featureName - The name of the feature
   * @param {Object} options - Additional options for template generation
   * @returns {string} The generated template content
   */
  generate(featureName, options = {}) {
    throw new Error('Method must be implemented');
  }
}

/**
 * Interface for file system operations
 */
class IFileSystemManager {
  /**
   * Create directories recursively
   * @param {string[]} directories - Array of directory paths to create
   */
  createDirectories(directories) {
    throw new Error('Method must be implemented');
  }

  /**
   * Create a file with content
   * @param {string} filePath - Path to the file
   * @param {string} content - Content to write
   */
  createFile(filePath, content) {
    throw new Error('Method must be implemented');
  }

  /**
   * Append content to a file
   * @param {string} filePath - Path to the file
   * @param {string} content - Content to append
   */
  appendToFile(filePath, content) {
    throw new Error('Method must be implemented');
  }

  /**
   * Check if file exists
   * @param {string} filePath - Path to check
   * @returns {boolean} True if file exists
   */
  fileExists(filePath) {
    throw new Error('Method must be implemented');
  }
}

/**
 * Interface for command execution
 */
class ICommandExecutor {
  /**
   * Execute a command
   * @param {string} command - Command to execute
   * @param {string[]} args - Arguments for the command
   * @param {Object} options - Additional options
   * @returns {Promise<void>}
   */
  execute(command, args = [], options = {}) {
    throw new Error('Method must be implemented');
  }
}

/**
 * Interface for input validation
 */
class IValidator {
  /**
   * Validate feature name
   * @param {string} featureName - Feature name to validate
   * @returns {boolean} True if valid
   */
  validateFeatureName(featureName) {
    throw new Error('Method must be implemented');
  }
}

/**
 * Interface for configuration management
 */
class IConfigurationManager {
  /**
   * Get project paths configuration
   * @returns {Object} Configuration object with paths
   */
  getProjectPaths() {
    throw new Error('Method must be implemented');
  }

  /**
   * Get DDD directory structure
   * @param {string} featureName - Feature name
   * @returns {string[]} Array of directory paths
   */
  getDDDDirectories(featureName) {
    throw new Error('Method must be implemented');
  }
}

module.exports = {
  ITemplateGenerator,
  IFileSystemManager,
  ICommandExecutor,
  IValidator,
  IConfigurationManager,
};
