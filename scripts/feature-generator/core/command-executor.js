const { spawn } = require('child_process');
const { ICommandExecutor } = require('../core/interfaces');

/**
 * Command Executor
 * Responsible for executing system commands
 * Single Responsibility: Handle command execution
 */
class CommandExecutor extends ICommandExecutor {
  constructor() {
    super();
  }

  /**
   * Execute a command
   * @param {string} command - Command to execute
   * @param {string[]} args - Arguments for the command
   * @param {Object} options - Additional options
   * @returns {Promise<void>}
   */
  execute(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const defaultOptions = {
        stdio: 'inherit',
        cwd: process.cwd(),
        shell: true,
        ...options,
      };

      const child = spawn(command, args, defaultOptions);

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Execute NestJS generate command
   * @param {string} type - Type of resource to generate (module, controller, etc.)
   * @param {string} name - Name/path of the resource
   * @param {Object} options - Additional NestJS CLI options
   * @returns {Promise<void>}
   */
  async executeNestGenerate(type, name, options = {}) {
    const args = ['nest', 'g', type, name];

    // Add common NestJS CLI options
    if (options.project) {
      args.push('--project', options.project);
    }
    if (options.noSpec) {
      args.push('--no-spec');
    }
    if (options.flat) {
      args.push('--flat');
    }

    return this.execute('npx', args);
  }

  /**
   * Generate NestJS module
   * @param {string} modulePath - Path for the module
   * @param {string} project - Project name
   * @returns {Promise<void>}
   */
  async generateModule(modulePath, project = 'server') {
    return this.executeNestGenerate('module', modulePath, { project });
  }

  /**
   * Generate NestJS controller
   * @param {string} controllerPath - Path for the controller
   * @param {string} project - Project name
   * @returns {Promise<void>}
   */
  async generateController(controllerPath, project = 'server') {
    return this.executeNestGenerate('controller', controllerPath, {
      project,
      noSpec: true,
      flat: true,
    });
  }
}

module.exports = { CommandExecutor };
