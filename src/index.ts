#!/usr/bin/env node

import { logger } from './utils/logger.js';
import {
  promptTokenExpiration,
  promptOrganizations,
  promptBypass2FA,
  promptTokenName
} from './utils/prompts.js';
import {
  checkNpmVersion,
  checkAuthentication,
  performLogin,
  getCurrentAuthToken,
  createGranularToken
} from './services/npm-auth.service.js';
import { fetchUserOrganizations } from './services/npm-org.service.js';
import { updateNpmrc, updateYarnrc } from './services/config.service.js';

async function main() {
  logger.banner('🔐 npm-keep-me-logged-in');

  // Step 0: Check npm version
  logger.info('Checking npm version...');
  const versionCheck = await checkNpmVersion();

  if (!versionCheck.isValid) {
    logger.error(`npm v11+ is required, but you have npm v${versionCheck.version}`);
    logger.gray('Please upgrade npm: npm install -g npm@latest');
    logger.newline();
    process.exit(1);
  }

  logger.success(`npm v${versionCheck.version} detected`);
  logger.newline();

  // Step 1: Always perform npm login to get a fresh classic token session
  // This is required because granular tokens can't create new tokens
  logger.info('Running npm login to create a fresh session...');
  logger.gray('This creates a temporary classic token needed for token creation');
  logger.newline();

  const loginSuccess = await performLogin();
  if (!loginSuccess) {
    logger.error('Login failed');
    process.exit(1);
  }

  // Get username after login
  const authResult = await checkAuthentication();
  if (!authResult.isAuthenticated) {
    logger.error('Authentication failed after login');
    process.exit(1);
  }

  const username = authResult.username!;
  logger.success(`Authenticated as ${username}`);
  logger.newline();

  // Step 2: Get session token
  logger.info('Reading session token from .npmrc...');
  const sessionToken = await getCurrentAuthToken();

  if (!sessionToken) {
    logger.error('No session token found in .npmrc');
    logger.gray('Please run `npm login` first');
    process.exit(1);
  }

  logger.success('Session token found');
  logger.newline();

  // Step 3: Fetch organizations
  logger.info('Fetching your npm organizations...');
  const orgs = await fetchUserOrganizations(username, sessionToken);

  // Filter out username from orgs (username is not a real organization)
  const realOrgs = orgs.filter(org => org !== username);
  logger.success(`Found ${realOrgs.length} organization(s)`);
  logger.newline();

  // Step 4: Interactive prompts
  const tokenName = await promptTokenName();
  const expiration = await promptTokenExpiration();
  const selectedOrgs = realOrgs.length > 0 ? await promptOrganizations(realOrgs) : [];
  const bypass2FA = await promptBypass2FA();

  // Step 5: Create token (npm will prompt for password and OTP interactively)
  logger.newline();
  logger.info('Creating granular access token...');
  logger.gray('npm will prompt for your password and 2FA code');
  logger.newline();

  const result = await createGranularToken({
    sessionToken,
    tokenName,
    expiration,
    organizations: selectedOrgs,
    bypass2FA
  });

  if (!result.success) {
    logger.error(`Token creation failed: ${result.error}`);
    logger.gray('\nYou can create tokens manually at: https://npmjs.com/settings/~/tokens');
    process.exit(1);
  }

  const token = result.token;
  logger.newline();
  logger.success('Token created successfully');

  // Show truncated token preview
  const truncatedToken = token.substring(0, 15) + '...';
  logger.gray(`Token: ${truncatedToken}`);
  logger.newline();

  // Step 6: Update config files
  logger.info('Updating configuration files...');

  try {
    await updateNpmrc(token);
    logger.success('Updated ~/.npmrc');

    await updateYarnrc(token);
    logger.success('Updated ~/.yarnrc.yml');
  } catch (error: any) {
    logger.error(`Failed to update config files: ${error.message}`);
    logger.warning('\nYour token:');
    logger.gray(token);
    logger.warning('\nPlease add it manually to your config files.');
    process.exit(1);
  }

  // Step 7: Success message
  logger.newline();
  logger.success('All done!');
  logger.gray(`Token name: ${tokenName}`);
  logger.gray(`Token will expire in ${expiration} days`);
  logger.gray('Backups of your config files have been created');
  logger.newline();
}

main().catch((error) => {
  logger.error('Unexpected error:');
  console.error(error);
  process.exit(1);
});
