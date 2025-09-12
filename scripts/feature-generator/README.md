# Feature Generator

## Overview

This is a refactored version of the original monolithic `generate-feature.js` script, now following SOLID principles for better maintainability, extensibility, and testability.

## Directory Structure

```
feature-generator/
├── core/                          # Core business logic
│   ├── interfaces.js              # Interface definitions
│   ├── file-system-manager.js     # File system operations
│   ├── command-executor.js        # Command execution
│   ├── configuration-manager.js   # Configuration management
│   ├── input-validator.js         # Input validation
│   └── feature-generator-orchestrator.js  # Main orchestrator
├── templates/                     # Template generators
│   ├── base-template-generator.js # Base class for all generators
│   ├── dto-template-generator.js  # DTO template generation
│   ├── entity-template-generator.js # Entity template generation
│   ├── repository-template-generator.js # Repository template generation
│   └── usecase-template-generator.js # Use case template generation
├── index.js                       # Module exports
└── README.md                      # This file
```

## Usage

### Using the Refactored Script
```bash
# Use the new refactored script
node scripts/generate-feature-refactored.js my-feature
```

### Programmatic Usage
```javascript
const { FeatureGeneratorOrchestrator } = require('./feature-generator');

const orchestrator = new FeatureGeneratorOrchestrator();
await orchestrator.generateFeature('my-feature');
```

## Benefits of the Refactor

### 1. Maintainability
- **Easier to modify**: Each class has a single responsibility
- **Easier to debug**: Issues are isolated to specific classes
- **Easier to understand**: Clear separation of concerns

### 2. Extensibility
- **Add new templates**: Create new classes extending `BaseTemplateGenerator`
- **Add new file operations**: Extend `FileSystemManager`
- **Add new validations**: Extend `InputValidator`

### 3. Testability
- **Unit testing**: Each class can be tested in isolation
- **Mocking**: Dependencies can be easily mocked
- **Integration testing**: Components can be tested together

### 4. Reusability
- **Component reuse**: Classes can be used in other scripts
- **Flexible composition**: Mix and match components as needed

## Examples

### Adding a New Template Generator

```javascript
const { BaseTemplateGenerator } = require('./base-template-generator');

class ServiceTemplateGenerator extends BaseTemplateGenerator {
  generate(featureName, options = {}) {
    const capitalizedName = this.capitalize(featureName);

    return `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${capitalizedName}Service {
  // Service implementation
}
`;
  }
}
```

### Custom File Operations

```javascript
const { FileSystemManager } = require('./core/file-system-manager');

const fileManager = new FileSystemManager();
fileManager.createFile('path/to/file.ts', 'content');
fileManager.createDirectories(['dir1', 'dir2']);
```

### Custom Command Execution

```javascript
const { CommandExecutor } = require('./core/command-executor');

const executor = new CommandExecutor();
await executor.execute('npm', ['install', 'package-name']);
```

## Migration from Original Script

The original script functionality is preserved while providing:
1. Better error handling
2. More flexible configuration
3. Easier maintenance
4. Better testing capabilities
5. Clear separation of concerns

## Future Enhancements

The refactored structure makes it easy to add:
- Configuration file support
- Custom template loading
- Plugin system
- CLI improvements
- Advanced validation
- Logging system
- Progress indicators
