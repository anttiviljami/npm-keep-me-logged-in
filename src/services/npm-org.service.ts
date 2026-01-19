import { input } from '@inquirer/prompts';
import { logger } from '../utils/logger.js';

export async function fetchUserOrganizations(
  username: string,
  authToken: string
): Promise<string[]> {
  try {
    // Try method 1: Get user's packages from the npm registry
    const response = await fetch(
      `https://registry.npmjs.org/-/v1/search?text=maintainer:${username}&size=250`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    if (!response.ok) {
      logger.warning(`Could not fetch organizations from npm API (HTTP ${response.status})`);
      logger.gray('Falling back to manual input');
      return await promptManualOrgInput();
    }

    const data = await response.json();

    // Extract org names from scoped packages
    const orgs = new Set<string>();

    if (data && data.objects && Array.isArray(data.objects)) {
      for (const obj of data.objects) {
        if (obj.package && obj.package.name && obj.package.name.startsWith('@')) {
          // Extract org name from @org/package format
          const orgName = obj.package.name.split('/')[0].substring(1);
          orgs.add(orgName);
        }
      }
    }

    // If no orgs found, also check for published packages directly
    if (orgs.size === 0) {
      logger.gray('No scoped packages found, you may not have any organization access');
    }

    return Array.from(orgs);
  } catch (error: any) {
    logger.warning(`Error fetching organizations: ${error.message}`);
    logger.gray('Falling back to manual input');
    return await promptManualOrgInput();
  }
}

async function promptManualOrgInput(): Promise<string[]> {
  logger.gray('You can manually enter organization names');

  const orgInput = await input({
    message: 'Enter organization names (comma-separated, or leave empty to skip):',
    default: '',
    validate: (value) => {
      if (!value) return true; // Allow empty

      // Check each org name is valid
      const orgs = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
      if (orgs.length > 50) {
        return 'Maximum 50 organizations allowed';
      }
      return true;
    }
  });

  if (!orgInput) {
    return [];
  }

  return orgInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
}
