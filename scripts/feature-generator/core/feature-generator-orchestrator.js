const { DTOTemplateGenerator } = require('../templates/dto-template-generator');
const {
  EntityTemplateGenerator,
} = require('../templates/entity-template-generator');
const {
  RepositoryTemplateGenerator,
} = require('../templates/repository-template-generator');
const {
  UseCaseTemplateGenerator,
} = require('../templates/usecase-template-generator');
const {
  ControllerTemplateGenerator,
} = require('../templates/controller-template-generator');
const { FileSystemManager } = require('./file-system-manager');
const { CommandExecutor } = require('./command-executor');
const { ConfigurationManager } = require('./configuration-manager');

/**
 * Feature Generator Orchestrator
 * Responsible for coordinating the entire feature generation process
 * Single Responsibility: Orchestrate the feature generation workflow
 * Open/Closed Principle: Easy to extend with new generators
 * Dependency Inversion: Depends on abstractions (interfaces) not concrete classes
 */
class FeatureGeneratorOrchestrator {
  constructor() {
    // Dependency injection - following Dependency Inversion Principle
    this.dtoGenerator = new DTOTemplateGenerator();
    this.entityGenerator = new EntityTemplateGenerator();
    this.repositoryGenerator = new RepositoryTemplateGenerator();
    this.useCaseGenerator = new UseCaseTemplateGenerator();
    this.controllerGenerator = new ControllerTemplateGenerator();
    this.fileSystemManager = new FileSystemManager();
    this.commandExecutor = new CommandExecutor();
    this.configurationManager = new ConfigurationManager();
  }

  /**
   * Generate a complete feature following DDD patterns
   * @param {string} featureName - Name of the feature to generate
   * @returns {Promise<void>}
   */
  async generateFeature(featureName) {
    try {
      console.log(`🚀 Generating feature: ${featureName}`);

      // Step 1: Generate NestJS module (skip controller, we'll generate custom one with Swagger)
      await this.generateNestJSModule(featureName);

      // Step 2: Create DDD directory structure
      this.createDDDStructure(featureName);

      // Step 3: Generate and create template files (including Swagger controller)
      await this.generateTemplateFiles(featureName);

      // Step 4: Update barrel files
      this.updateBarrelFiles(featureName);

      // Step 5: Show completion message and next steps
      this.showCompletionMessage(featureName);
    } catch (error) {
      console.error('❌ Error generating feature:', error.message);
      throw error;
    }
  }

  /**
   * Generate NestJS module only (controller will be generated with Swagger)
   * @param {string} featureName - Feature name
   * @returns {Promise<void>}
   */
  async generateNestJSModule(featureName) {
    const nestPaths = this.configurationManager.getNestJSPaths(featureName);
    const config = this.configurationManager.getProjectConfig();

    console.log('📁 Generating NestJS module...');
    await this.commandExecutor.generateModule(
      nestPaths.module,
      config.defaultProject,
    );
  }

  /**
   * Create DDD directory structure
   * @param {string} featureName - Feature name
   */
  createDDDStructure(featureName) {
    console.log('📂 Creating DDD folder structure...');
    const directories =
      this.configurationManager.getDDDDirectories(featureName);
    this.fileSystemManager.createDirectories(directories);
  }

  /**
   * Generate and create all template files
   * @param {string} featureName - Feature name
   * @returns {Promise<void>}
   */
  async generateTemplateFiles(featureName) {
    console.log('📝 Creating template files...');

    const filePaths =
      this.configurationManager.getFeatureFilePaths(featureName);

    // Generate templates
    const dtoTemplates = this.dtoGenerator.generate(featureName);
    const entityTemplate = this.entityGenerator.generate(featureName);
    const repositoryTemplates = this.repositoryGenerator.generate(featureName);
    const useCaseTemplate = this.useCaseGenerator.generate(featureName);
    const controllerTemplate = this.controllerGenerator.generate(featureName);

    console.log('🎮 Creating Swagger-enabled controller...');

    // Create file definitions
    const filesToCreate = [
      {
        path: filePaths.sharedDto,
        content: dtoTemplates.shared,
      },
      {
        path: filePaths.backendDto,
        content: dtoTemplates.backend,
      },
      {
        path: filePaths.controller,
        content: controllerTemplate,
      },
      {
        path: filePaths.entity,
        content: entityTemplate,
      },
      {
        path: filePaths.repositoryInterface,
        content: repositoryTemplates.interface,
      },
      {
        path: filePaths.repositoryImplementation,
        content: repositoryTemplates.implementation,
      },
      {
        path: filePaths.useCase,
        content: useCaseTemplate,
      },
    ];

    // Create all files
    this.fileSystemManager.createFiles(filesToCreate);
  }

  /**
   * Update barrel files (index.ts files for exports)
   * @param {string} featureName - Feature name
   */
  updateBarrelFiles(featureName) {
    console.log(`✍️  Updating shared-types barrel file...`);

    const filePaths =
      this.configurationManager.getFeatureFilePaths(featureName);
    const exportStatement = `export * from './${featureName}.dto';\n`;

    this.fileSystemManager.appendToFile(filePaths.barrelFile, exportStatement);
  }

  /**
   * Show completion message and next steps
   * @param {string} featureName - Feature name
   */
  showCompletionMessage(featureName) {
    console.log(`\n🎉 Feature "${featureName}" generated successfully!`);

    console.log('\n💡 Next steps:');
    console.log(
      `1. Update the DTO interface in 'packages/shared-types/src/${featureName}.dto.ts'`,
    );
    console.log(
      `2. Update the DTO class validation in 'apps/server/src/modules/${featureName}/application/dtos/'`,
    );
    console.log(
      `3. Implement business logic in the aggregate at 'apps/server/src/modules/${featureName}/domain/entities/'`,
    );
    console.log(
      `4. Implement the repository methods in 'apps/server/src/modules/${featureName}/infrastructure/repositories/'`,
    );
    console.log(
      `5. Implement use cases in 'apps/server/src/modules/${featureName}/application/use-cases/'`,
    );
    console.log(
      `6. Inject use cases into the Swagger controller at 'apps/server/src/modules/${featureName}/application/${featureName}.controller.ts'`,
    );
    console.log(
      `7. Provide and inject the repository in '${featureName}.module.ts'`,
    );
    console.log(`8. Register the controller in '${featureName}.module.ts'`);

    console.log('\n📚 Swagger Documentation:');
    console.log(
      `- The controller uses simplified Swagger decorators from infrastructure/decorators`,
    );
    console.log(
      `- All CRUD operations use standardized decorators with consistent schemas`,
    );
    console.log(
      `- Decorators are reusable across all features following DDD principles`,
    );
    console.log(
      `- Access the API documentation at http://localhost:3000/api when the server is running`,
    );
  }
}

module.exports = { FeatureGeneratorOrchestrator };
