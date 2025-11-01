#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Generate a combined PlantUML diagram showing all modules together
 * This provides a bird's-eye view of the entire domain model
 */

const SERVER_ROOT = path.join(__dirname, '..', 'apps', 'server');
const MODULES_PATH = path.join(SERVER_ROOT, 'src', 'modules');
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'uml');
const COMBINED_OUTPUT = path.join(OUTPUT_DIR, '_combined.puml');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function getModulesWithEntities() {
  const modules = [];
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
          files: entityFiles.map((f) => path.join(entitiesPath, f)),
        });
      }
    }
  }
  return modules;
}

/**
 * Extract all relationships from all modules
 */
function extractAllRelationships(modules) {
  const relationships = [];

  modules.forEach((module) => {
    module.entityFiles.forEach((file) => {
      const filePath = path.join(module.entitiesPath, file);
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
          arrow: '}o--',
          leftCard: '*',
          rightCard: '1',
        });
      }

      // Extract @OneToMany relationships (skip to avoid duplicates)
      const oneToManyRegex = /@OneToMany\(\(\)\s*=>\s*(\w+)/g;
      while ((match = oneToManyRegex.exec(content)) !== null) {
        // Skip - ManyToOne from the other side handles this
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
  });

  // Deduplicate relationships
  const uniqueRelationships = [];
  const seen = new Set();

  relationships.forEach((rel) => {
    const key = `${rel.from}-${rel.to}-${rel.type}`;
    const reverseKey = `${rel.to}-${rel.from}`;
    if (!seen.has(key) && !seen.has(reverseKey)) {
      seen.add(key);
      seen.add(reverseKey);
      uniqueRelationships.push(rel);
    }
  });

  return uniqueRelationships;
}

function generateCombinedDiagram() {
  log('\n🔄 Generating combined PlantUML diagram...', colors.cyan);

  const modules = getModulesWithEntities();

  if (modules.length === 0) {
    log('⚠️  No modules with entities found!', colors.reset);
    return;
  }

  // Collect all entity file paths
  const allEntityFiles = modules.flatMap((m) => m.files);

  try {
    // Use a glob pattern approach instead of listing individual files
    // tplant works better with patterns
    const modulesPattern = path.join(MODULES_PATH, '*/domain/entities/*.ts');
    const command = `npx tplant -i "${modulesPattern}" -o "${COMBINED_OUTPUT}"`;

    execSync(command, { cwd: SERVER_ROOT, stdio: 'pipe' });

    // Extract relationships from all modules
    const relationships = extractAllRelationships(modules);

    // Add module annotations and relationships to the diagram
    if (fs.existsSync(COMBINED_OUTPUT)) {
      let content = fs.readFileSync(COMBINED_OUTPUT, 'utf-8');

      // Add header comment
      const header = `' Combined Domain Model\n' Generated: ${new Date().toISOString()}\n' Modules: ${modules.map((m) => m.name).join(', ')}\n\n`;
      content = content.replace('@startuml', '@startuml\n' + header);

      // Add relationships before @enduml
      if (relationships.length > 0) {
        content = content.replace(/@enduml\s*$/, '');
        content += "\n' Relationships\n";
        relationships.forEach((rel) => {
          // Professional UML notation with cardinality
          content += `${rel.from} "${rel.leftCard}" ${rel.arrow} "${rel.rightCard}" ${rel.to}\n`;
        });
        content += '@enduml\n';
      }

      fs.writeFileSync(COMBINED_OUTPUT, content);

      const stats = fs.statSync(COMBINED_OUTPUT);
      log(
        `✓ Combined diagram generated: _combined.puml (${stats.size} bytes)`,
        colors.green,
      );
      log(
        `  Includes ${modules.length} modules with ${allEntityFiles.length} entities`,
        colors.blue,
      );
      if (relationships.length > 0) {
        log(`  Added ${relationships.length} relationship(s)`, colors.blue);
      }
    }
  } catch (error) {
    log(`✗ Failed to generate combined diagram: ${error.message}`, '\x1b[31m');
    process.exit(1);
  }
}

// Run
generateCombinedDiagram();
