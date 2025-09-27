const fs = require('fs-extra');
const path = require('path');
const { logger } = require('./utils');

class SetupManager {
  constructor() {
    this.projectRoot = path.dirname(__dirname);
  }

  async initializeProject() {
    console.log('=== SLC WhatsApp Automation Setup ===');
    console.log('Initializing project...\n');

    try {
      // Ensure directories exist
      await this.ensureDirectories();
      
      // Check if files exist, create if needed
      await this.ensureConfigFiles();
      
      // Install dependencies
      await this.installDependencies();
      
      console.log('\nSetup completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Edit groups.txt - Add your WhatsApp group names/IDs (one per line)');
      console.log('2. Edit message.txt - Add your message content');
      console.log('3. Run start.bat to begin scheduled sending');
      console.log('4. Run send-now.bat for immediate sending');
      
      logger.info('Setup completed successfully');
      
    } catch (error) {
      console.error('Setup failed:', error.message);
      logger.error(`Setup failed: ${error.message}`);
    }
  }

  async ensureDirectories() {
    const dirs = ['logs', 'src'];
    for (const dir of dirs) {
      const dirPath = path.join(this.projectRoot, dir);
      await fs.ensureDir(dirPath);
      console.log(`Directory ensured: ${dir}`);
    }
  }

  async ensureConfigFiles() {
    const files = [
      {
        path: '.env',
        content: `# WhatsApp Automation Settings
CRON_SCHEDULE=0 21 * * *
SESSION_PATH=./session.json
LOG_PATH=./logs/app.log
MESSAGE_PATH=./message.txt
GROUPS_PATH=./groups.txt
DELAY_BETWEEN_MESSAGES=3000`
      },
      {
        path: 'groups.txt',
        content: `# Add your WhatsApp group names/IDs here (one per line)
# Example:
# Family Group
# Work Team
# Friends Chat`
      },
      {
        path: 'message.txt',
        content: `Hello! This is an automated message from SLC WhatsApp Automation.

Edit this file to customize your message content.`
      }
    ];

    for (const file of files) {
      const filePath = path.join(this.projectRoot, file.path);
      if (!await fs.pathExists(filePath)) {
        await fs.writeFile(filePath, file.content);
        console.log(`Created: ${file.path}`);
      } else {
        console.log(`Already exists: ${file.path}`);
      }
    }
  }

  async installDependencies() {
    console.log('\nInstalling Node.js dependencies...');
    
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      const npm = spawn('npm', ['install'], {
        cwd: this.projectRoot,
        stdio: 'inherit',
        shell: true
      });

      npm.on('close', (code) => {
        if (code === 0) {
          console.log('Dependencies installed successfully');
          resolve();
        } else {
          reject(new Error(`npm install failed with code ${code}`));
        }
      });

      npm.on('error', (error) => {
        reject(error);
      });
    });
  }
}

// Run setup
const setup = new SetupManager();
setup.initializeProject().then(() => {
  console.log('\nPress any key to close...');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', process.exit.bind(process, 0));
});