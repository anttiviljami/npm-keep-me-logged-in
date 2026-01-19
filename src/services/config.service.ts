import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as ini from 'ini';
import * as yaml from 'js-yaml';
import { createBackup, cleanupOldBackups } from './backup.service.js';

export async function updateNpmrc(token: string): Promise<void> {
  const npmrcPath = path.join(os.homedir(), '.npmrc');

  // Create backup
  await createBackup(npmrcPath);

  let config: any = {};

  // Read existing .npmrc if it exists
  try {
    const content = await fs.readFile(npmrcPath, 'utf-8');
    config = ini.parse(content);
  } catch (error: any) {
    // File doesn't exist, will create new one
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  // Update auth token
  config['//registry.npmjs.org/:_authToken'] = token;

  // Write back
  await fs.writeFile(npmrcPath, ini.stringify(config), 'utf-8');

  // Set restrictive permissions
  await fs.chmod(npmrcPath, 0o600);

  // Cleanup old backups
  await cleanupOldBackups(npmrcPath);
}

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

  // Update auth token for npm registry
  config.npmRegistries['//registry.npmjs.org'] = {
    npmAlwaysAuth: true,
    npmAuthToken: token
  };

  // Write back
  await fs.writeFile(yarnrcPath, yaml.dump(config), 'utf-8');

  // Set restrictive permissions
  await fs.chmod(yarnrcPath, 0o600);

  // Cleanup old backups
  await cleanupOldBackups(yarnrcPath);
}
