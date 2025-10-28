#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script to generate PlantUML files for all modules in the project
 * Each module gets its own .puml file named after the module
 */

// Configuration
const SERVER_ROOT = path.join(__dirname, '..', 'apps', 'server');
const MODULES_PATH = path.join(SERVER_ROOT, 'src', 'modules');
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'uml');
const ENTITIES_PATTERN = 'domain/entities/*.ts';

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

/**
 * Get all module directories that have entity files
 */
function getModulesWithEntities() {
  const modules = [];

  if (!fs.existsSync(MODULES_PATH)) {
    logError(`Modules path does not exist: ${MODULES_PATH}`);
    return modules;
  }

  const moduleFolders = fs
    .readdirSync(MODULES_PATH, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const moduleName of moduleFolders) {
    const entitiesPath = path.join(
      MODULES_PATH,
      moduleName,
      'domain',
      'entities',
    );

    if (fs.existsSync(entitiesPath)) {
      const entityFiles = fs
        .readdirSync(entitiesPath)
        .filter((file) => file.endsWith('.ts') && !file.endsWith('.spec.ts'));

      if (entityFiles.length > 0) {
        modules.push({
          name: moduleName,
          entitiesPath,
          entityFiles,
        });
      }
    }
  }

  return modules;
}

/**
 * Parse entity files to extract TypeORM relationships
 */
function extractRelationships(entitiesPath, entityFiles) {
  const relationships = [];

  entityFiles.forEach((file) => {
    const filePath = path.join(entitiesPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract class name
    const classMatch = content.match(/export\s+class\s+(\w+)/);
    if (!classMatch) return;
    const className = classMatch[1];

    // Extract @ManyToOne relationships
    const manyToOneRegex = /@ManyToOne\(\(\)\s*=>\s*(\w+)/g;
    let match;
    while ((match = manyToOneRegex.exec(content)) !== null) {
      const targetClass = match[1];
      relationships.push({
        from: className,
        to: targetClass,
        type: 'many-to-one',
        arrow: '}o--', // UML standard: many-to-one
        leftCard: '*',
        rightCard: '1',
      });
    }

    // Extract @OneToMany relationships (skip to avoid duplicates with ManyToOne)
    // OneToMany is the inverse side, ManyToOne arrow is sufficient
    const oneToManyRegex = /@OneToMany\(\(\)\s*=>\s*(\w+)/g;
    while ((match = oneToManyRegex.exec(content)) !== null) {
      // Skip - the ManyToOne from the other side will handle this
    }

    // Extract @OneToOne relationships
    const oneToOneRegex = /@OneToOne\(\(\)\s*=>\s*(\w+)/g;
    while ((match = oneToOneRegex.exec(content)) !== null) {
      const targetClass = match[1];
      relationships.push({
        from: className,
        to: targetClass,
        type: 'one-to-one',
        arrow: '--',
        leftCard: '1',
        rightCard: '1',
      });
    }

    // Extract @ManyToMany relationships
    const manyToManyRegex = /@ManyToMany\(\(\)\s*=>\s*(\w+)/g;
    while ((match = manyToManyRegex.exec(content)) !== null) {
      const targetClass = match[1];
      relationships.push({
        from: className,
        to: targetClass,
        type: 'many-to-many',
        arrow: '}o--o{',
        leftCard: '*',
        rightCard: '*',
      });
    }
  });

  return relationships;
}

/**
 * Add relationships to PlantUML file
 */
function addRelationshipsToPlantUML(outputFile, relationships) {
  if (relationships.length === 0) return;

  let content = fs.readFileSync(outputFile, 'utf-8');

  // Remove the closing @enduml tag
  content = content.replace(/@enduml\s*$/, '');

  // Add relationships section
  content += "\n' Relationships\n";

  // Deduplicate relationships to avoid duplicate arrows
  const uniqueRelationships = [];
  const seen = new Set();

  relationships.forEach((rel) => {
    const key = `${rel.from}-${rel.to}-${rel.type}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueRelationships.push(rel);
    }
  });

  uniqueRelationships.forEach((rel) => {
    // Professional UML notation: Class "cardinality" arrow "cardinality" TargetClass
    content += `${rel.from} "${rel.leftCard}" ${rel.arrow} "${rel.rightCard}" ${rel.to}\n`;
  });

  // Add closing tag
  content += '@enduml\n';

  fs.writeFileSync(outputFile, content, 'utf-8');
}

/**
 * Generate PlantUML file for a specific module
 */
function generatePlantUMLForModule(module) {
  const { name, entitiesPath, entityFiles } = module;
  const outputFile = path.join(OUTPUT_DIR, `${name}.puml`);

  try {
    // Build the tplant command
    const inputPattern = path.join(entitiesPath, '*.ts');
    const command = `npx tplant -i "${inputPattern}" -o "${outputFile}"`;

    logInfo(`Generating PlantUML for module: ${name}`);
    logInfo(`  Entities: ${entityFiles.join(', ')}`);

    // Execute tplant
    execSync(command, {
      cwd: SERVER_ROOT,
      stdio: 'pipe',
    });

    // Extract and add relationships
    const relationships = extractRelationships(entitiesPath, entityFiles);
    if (relationships.length > 0) {
      addRelationshipsToPlantUML(outputFile, relationships);
      logInfo(`  Added ${relationships.length} relationship(s)`);
    }

    // Verify the file was created
    if (fs.existsSync(outputFile)) {
      const stats = fs.statSync(outputFile);
      logSuccess(`Generated ${name}.puml (${stats.size} bytes)`);
      return true;
    } else {
      logWarning(`File was not created for module: ${name}`);
      return false;
    }
  } catch (error) {
    logError(
      `Failed to generate PlantUML for module ${name}: ${error.message}`,
    );
    return false;
  }
}

/**
 * Clean up old PlantUML files that don't correspond to current modules
 */
function cleanupOldFiles(currentModules) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    return;
  }

  const currentModuleNames = currentModules.map((m) => `${m.name}.puml`);
  const existingFiles = fs
    .readdirSync(OUTPUT_DIR)
    .filter(
      (file) =>
        file.endsWith('.puml') &&
        file !== 'generated.puml' &&
        file !== '_combined.puml',
    ); // Keep legacy and combined files

  const filesToDelete = existingFiles.filter(
    (file) => !currentModuleNames.includes(file),
  );

  if (filesToDelete.length > 0) {
    logInfo('Cleaning up old PlantUML files...');
    filesToDelete.forEach((file) => {
      const filePath = path.join(OUTPUT_DIR, file);
      fs.unlinkSync(filePath);
      logInfo(`  Removed: ${file}`);
    });
  }
}

/**
 * Main execution function
 */
function main() {
  log('\n' + '='.repeat(60), colors.cyan);
  log('PlantUML Generator for NestJS Modules', colors.bright + colors.cyan);
  log('='.repeat(60) + '\n', colors.cyan);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    logInfo(`Created output directory: ${OUTPUT_DIR}`);
  }

  // Get all modules with entities
  const modules = getModulesWithEntities();

  if (modules.length === 0) {
    logWarning('No modules with entity files found!');
    logInfo(`Searched in: ${MODULES_PATH}`);
    process.exit(0);
  }

  log(`\nFound ${modules.length} module(s) with entities:\n`, colors.bright);
  modules.forEach((module) => {
    log(
      `  • ${module.name} (${module.entityFiles.length} entities)`,
      colors.cyan,
    );
  });
  log('');

  // Clean up old files
  cleanupOldFiles(modules);

  // Generate PlantUML for each module
  let successCount = 0;
  let failureCount = 0;

  modules.forEach((module) => {
    const success = generatePlantUMLForModule(module);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
  });

  // Summary
  log('\n' + '='.repeat(60), colors.cyan);
  log('Summary', colors.bright + colors.cyan);
  log('='.repeat(60), colors.cyan);
  logSuccess(`Successfully generated: ${successCount} file(s)`);
  if (failureCount > 0) {
    logError(`Failed: ${failureCount} file(s)`);
  }
  log(`Output directory: ${OUTPUT_DIR}\n`, colors.blue);

  process.exit(failureCount > 0 ? 1 : 0);
}

// Run the script
main();
