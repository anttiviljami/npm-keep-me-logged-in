import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../utils/logger.js';

export async function createBackup(filePath: string): Promise<void> {
  try {
    // Check if file exists
    await fs.access(filePath);

    // Create backup with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup.${timestamp}`;

    await fs.copyFile(filePath, backupPath);

    // Set restrictive permissions (0600) for security
    await fs.chmod(backupPath, 0o600);

    logger.gray(`Backup created: ${backupPath}`);
  } catch (error: any) {
    // File doesn't exist, no backup needed
    if (error.code !== 'ENOENT') {
      logger.warning(`Could not create backup: ${error.message}`);
    }
  }
}

export async function cleanupOldBackups(
  filePath: string,
  keepCount: number = 5
): Promise<void> {
  const dir = path.dirname(filePath);
  const basename = path.basename(filePath);

  try {
    const files = await fs.readdir(dir);
    const backups = files
      .filter(f => f.startsWith(`${basename}.backup.`))
      .sort()
      .reverse();

    // Delete old backups beyond keepCount
    for (const backup of backups.slice(keepCount)) {
      try {
        await fs.unlink(path.join(dir, backup));
      } catch (error) {
        // Ignore errors in cleanup
      }
    }
  } catch (error) {
    // Ignore errors in cleanup
  }
}
