import { execa } from 'execa';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as ini from 'ini';
import type {
  AuthenticationResult,
  TokenCreateOptions,
  TokenCreateResult,
} from '../types/index.js';

export async function checkAuthentication(): Promise<AuthenticationResult> {
  try {
    const { stdout } = await execa('npm', ['whoami']);
    return {
      isAuthenticated: true,
      username: stdout.trim()
    };
  } catch (error) {
    return { isAuthenticated: false };
  }
}

export async function performLogin(): Promise<boolean> {
  try {
    // npm login is interactive, so we need to inherit stdio
    await execa('npm', ['login'], { stdio: 'inherit' });
    return true;
  } catch (error) {
    return false;
  }
}

export async function getCurrentAuthToken(): Promise<string | null> {
  try {
    const npmrcPath = path.join(os.homedir(), '.npmrc');
    const content = await fs.readFile(npmrcPath, 'utf-8');
    const config = ini.parse(content);

    // Extract token from registry key
    const tokenKey = '//registry.npmjs.org/:_authToken';
    const token = config[tokenKey];

    return token || null;
  } catch (error) {
    return null;
  }
}

async function getUniqueTokenName(tokenName: string): Promise<string> {
  try {
    // List all tokens
    const { stdout } = await execa('npm', ['token', 'list', '--json'], {
      reject: false
    });

    if (!stdout) return tokenName;

    const tokens = JSON.parse(stdout);

    // Check if token name already exists
    const existingToken = tokens.find((t: any) =>
      t.token === tokenName || t.name === tokenName || t.description === tokenName
    );

    if (existingToken) {
      // Generate random suffix (3 characters: lowercase letters and numbers)
      const randomSuffix = Math.random().toString(36).substring(2, 5);
      return `${tokenName}-${randomSuffix}`;
    }

    return tokenName;
  } catch (error) {
    // If we can't check, just use the original name
    return tokenName;
  }
}

export async function createGranularToken(
  options: TokenCreateOptions
): Promise<TokenCreateResult> {
  try {
    // Get username to filter it out from orgs
    const { stdout: username } = await execa('npm', ['whoami']);
    const usernameClean = username.trim();

    // Get a unique token name (appends random suffix if name already exists)
    const uniqueTokenName = await getUniqueTokenName(options.tokenName);

    // Build npm token create command arguments for npm v11+
    const args = [
      'token',
      'create',
      '--name', uniqueTokenName,
      '--token-description', uniqueTokenName,
      '--expires', options.expiration.toString(),
      '--packages-all'
    ];

    // Add organizations if provided (exclude username as it's not a real org)
    const realOrgs = options.organizations.filter(org => org !== usernameClean);
    if (realOrgs.length > 0) {
      for (const org of realOrgs) {
        args.push('--orgs', org);
      }
      args.push('--orgs-permission', 'read-write');
    }

    // Add bypass 2FA if requested
    if (options.bypass2FA) {
      args.push('--bypass-2fa');
    }

    try {
      // Run npm token create interactively - npm will prompt for password and OTP
      await execa('npm', args, { stdio: 'inherit' });

      // After successful creation, get the most recent token
      // We need to read it from .npmrc since interactive mode doesn't output it to stdout
      const token = await getCurrentAuthToken();

      if (token) {
        return {
          token,
          success: true
        };
      } else {
        return {
          token: '',
          success: false,
          error: 'Token creation may have succeeded, but could not read token from .npmrc'
        };
      }
    } catch (error: any) {
      return {
        token: '',
        success: false,
        error: `npm token create failed: ${error.message}`
      };
    }
  } catch (error: any) {
    return {
      token: '',
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}
