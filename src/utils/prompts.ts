import { select, checkbox, confirm, input, password } from '@inquirer/prompts';

export async function promptTokenExpiration(): Promise<number> {
  return await select({
    message: 'Token expiration:',
    choices: [
      { name: '7 days', value: 7 },
      { name: '30 days', value: 30 },
      { name: '60 days', value: 60 },
      { name: '90 days (maximum)', value: 90 }
    ],
    default: 90
  });
}

export async function promptOrganizations(orgs: string[]): Promise<string[]> {
  if (orgs.length === 0) {
    return [];
  }

  return await checkbox({
    message: 'Select organizations to include:',
    choices: orgs.map(org => ({
      name: org,
      value: org,
      checked: true  // All selected by default
    })),
    required: false,
    validate: (selected) => {
      if (selected.length > 50) {
        return 'Maximum 50 organizations allowed per token';
      }
      return true;
    }
  });
}

export async function promptBypass2FA(): Promise<boolean> {
  return await confirm({
    message: 'Bypass 2FA for this token? (not recommended)',
    default: false
  });
}

export async function promptUpdateYarnrc(): Promise<boolean> {
  return await confirm({
    message: 'Update ~/.yarnrc.yml with the token? (prevents needing to run yarn npm login)',
    default: true
  });
}

export async function promptPassword(): Promise<string> {
  return await password({
    message: 'Enter your npm password:',
    mask: '*',
    validate: (value) => {
      if (!value || value.length === 0) {
        return 'Password is required';
      }
      return true;
    }
  });
}

export async function promptOTP(): Promise<string> {
  return await input({
    message: 'Enter your 2FA code:',
    validate: (value) => {
      if (!/^\d{6}$/.test(value)) {
        return 'Please enter a valid 6-digit code';
      }
      return true;
    }
  });
}

export async function promptTokenName(): Promise<string> {
  const timestamp = new Date().toISOString().split('T')[0];
  const defaultName = `npm-keep-me-logged-in-${timestamp}`;

  return await input({
    message: 'Token name/description:',
    default: defaultName,
    validate: (value) => {
      if (!value || value.length === 0) {
        return 'Token name is required';
      }
      return true;
    }
  });
}
