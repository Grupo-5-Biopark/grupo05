/**
 * Feature Generator Module Exports
 *
 * This file provides a clean API for the feature generator components
 */

// Core components
const {
  FeatureGeneratorOrchestrator,
} = require('./core/feature-generator-orchestrator');
const { FileSystemManager } = require('./core/file-system-manager');
const { CommandExecutor } = require('./core/command-executor');
const { ConfigurationManager } = require('./core/configuration-manager');
const { InputValidator } = require('./core/input-validator');

// Template generators
const { DTOTemplateGenerator } = require('./templates/dto-template-generator');
const {
  EntityTemplateGenerator,
} = require('./templates/entity-template-generator');
const {
  RepositoryTemplateGenerator,
} = require('./templates/repository-template-generator');
const {
  UseCaseTemplateGenerator,
} = require('./templates/usecase-template-generator');
const {
  BaseTemplateGenerator,
} = require('./templates/base-template-generator');

// Interfaces
const {
  ITemplateGenerator,
  IFileSystemManager,
  ICommandExecutor,
  IValidator,
  IConfigurationManager,
} = require('./core/interfaces');

module.exports = {
  // Main orchestrator
  FeatureGeneratorOrchestrator,

  // Core services
  FileSystemManager,
  CommandExecutor,
  ConfigurationManager,
  InputValidator,

  // Template generators
  DTOTemplateGenerator,
  EntityTemplateGenerator,
  RepositoryTemplateGenerator,
  UseCaseTemplateGenerator,
  BaseTemplateGenerator,

  // Interfaces
  ITemplateGenerator,
  IFileSystemManager,
  ICommandExecutor,
  IValidator,
  IConfigurationManager,
};
