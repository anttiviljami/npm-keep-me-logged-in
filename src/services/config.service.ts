import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as yaml from 'js-yaml';
import { createBackup, cleanupOldBackups } from './backup.service.js';

export async function updateYarnrc(token: string): Promise<void> {
  const yarnrcPath = path.join(os.homedir(), '.yarnrc.yml');

  // Create backup
  await createBackup(yarnrcPath);

  let config: any = {};

  // Read existing .yarnrc.yml if it exists
  try {
    const content = await fs.readFile(yarnrcPath, 'utf-8');
    const parsed = yaml.load(content);
    config = parsed || {};
  } catch (error: any) {
    // File doesn't exist, will create new one
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  // Initialize npmRegistries if it doesn't exist
  if (!config.npmRegistries) {
    config.npmRegistries = {};
  }

  // Update auth token for yarn registry (default for yarn npm login)
  config.npmRegistries['https://registry.yarnpkg.com'] = {
    npmAlwaysAuth: true,
    npmAuthToken: token
  };

  // Update auth token for npm registry (if exists)
  const npmRegistry = config.npmRegistries['//registry.npmjs.org'] || config.npmRegistries['https://registry.npmjs.org'];
  if (npmRegistry) {
    npmRegistry.npmAlwaysAuth = true;
    npmRegistry.npmAuthToken = token;
  }

  // Write back
  await fs.writeFile(yarnrcPath, yaml.dump(config), 'utf-8');

  // Set restrictive permissions
  await fs.chmod(yarnrcPath, 0o600);

  // Cleanup old backups
  await cleanupOldBackups(yarnrcPath);
}
