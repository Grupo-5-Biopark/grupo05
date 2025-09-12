const fs = require('fs');
const path = require('path');
const { IFileSystemManager } = require('../core/interfaces');

/**
 * File System Manager
 * Responsible for all file system operations
 * Single Responsibility: Handle file and directory operations
 */
class FileSystemManager extends IFileSystemManager {
  constructor() {
    super();
  }

  /**
   * Create directories recursively
   * @param {string[]} directories - Array of directory paths to create
   */
  createDirectories(directories) {
    const createdDirs = [];

    directories.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        createdDirs.push(path.relative(process.cwd(), dir));
        console.log(`✅ Created: ${path.relative(process.cwd(), dir)}`);
      }
    });

    return createdDirs;
  }

  /**
   * Create a file with content
   * @param {string} filePath - Path to the file
   * @param {string} content - Content to write
   */
  createFile(filePath, content) {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Created: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    return false;
  }

  /**
   * Append content to a file
   * @param {string} filePath - Path to the file
   * @param {string} content - Content to append
   */
  appendToFile(filePath, content) {
    fs.appendFileSync(filePath, content);
    console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
  }

  /**
   * Check if file exists
   * @param {string} filePath - Path to check
   * @returns {boolean} True if file exists
   */
  fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * Create multiple files at once
   * @param {Array} fileDefinitions - Array of {path, content} objects
   */
  createFiles(fileDefinitions) {
    const createdFiles = [];

    fileDefinitions.forEach(({ path: filePath, content }) => {
      if (this.createFile(filePath, content)) {
        createdFiles.push(filePath);
      }
    });

    return createdFiles;
  }

  /**
   * Get relative path from current working directory
   * @param {string} absolutePath - Absolute path
   * @returns {string} Relative path
   */
  getRelativePath(absolutePath) {
    return path.relative(process.cwd(), absolutePath);
  }
}

module.exports = { FileSystemManager };
