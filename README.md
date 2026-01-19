# 🔐 npm-keep-me-logged-in

[![npm version](https://img.shields.io/npm/v/npm-keep-me-logged-in.svg)](https://www.npmjs.com/package/npm-keep-me-logged-in)
[![License](http://img.shields.io/:license-mit-blue.svg)](https://github.com/anttiviljami/npm-keep-me-logged-in/blob/master/LICENSE)
[![Buy me a coffee](https://img.shields.io/badge/donate-buy%20me%20a%20coffee-orange)](https://buymeacoff.ee/anttiviljami)

**Stop logging into npm every day.** Generate a long-lived granular access token (up to 90 days) and automatically configure your `~/.npmrc` and `~/.yarnrc.yml` files.

```sh
npx npm-keep-me-logged-in
```

## The Problem

After npm deprecated classic tokens, `npm login` now creates tokens that expire after just 24 hours. If you work with private packages, you have to log in every single day. This CLI tool solves that by creating a proper granular access token that lasts up to 90 days.

## What This Tool Does

This is an **interactive CLI wrapper** around the official npm commands. It doesn't do anything you couldn't do manually. It just automates the process and makes it easier. Here's exactly what happens:

### Step-by-Step Process

1. **Checks npm version** - Ensures you have npm v11+ installed
2. **Runs `npm login`** - Creates a fresh authentication session
3. **Fetches your organizations** - Queries the npm registry API to find organizations you have access to (based on your published scoped packages)
4. **Prompts for token configuration**:
   - Token name (default: `npm-keep-me-logged-in-YYYY-MM-DD`)
   - Expiration (7/30/60/90 days, default 90)
   - Organizations to include (all selected by default)
   - Bypass 2FA option (default: no)
5. **Runs `npm token create`** interactively - npm will prompt you for:
   - Your npm password
   - Your 2FA code
6. **Asks if you want to update Yarn configuration** (optional, default: yes):
   - If yes, reads the created token from `~/.npmrc`
   - Backs up existing `~/.yarnrc.yml` (with timestamp)
   - Updates `~/.yarnrc.yml` with the new token

### What This Tool Does NOT Do

- ❌ **Does not store your password** - It's only used by npm's interactive prompt
- ❌ **Does not send data anywhere** - Everything happens locally using official npm commands
- ❌ **Does not bypass npm security** - It uses the same `npm token create` command you would use manually
- ❌ **Does not read your files** - Only reads `~/.npmrc` if you choose to update Yarn configuration

## Requirements

- **Node.js 18+** (required for native fetch API)
- **npm v11+** (required for full granular token support with CLI flags)
- **2FA enabled** on your npm account (npm requirement for granular tokens)

## Usage

### Basic Usage

```sh
$ npx npm-keep-me-logged-in
```

The CLI will guide you through the process with interactive prompts.

### Demo

Here's what the experience looks like:

```sh
$ npx npm-keep-me-logged-in

🔐 npm-keep-me-logged-in

→ Checking npm version...
✓ npm v11.7.0 detected

→ Running npm login to create a fresh session...
  This creates a temporary classic token needed for token creation

npm notice Log in on https://registry.npmjs.org/
npm notice Security Notice: Classic tokens have been revoked. Granular tokens are now limited to 90 days and require 2FA by default. Update your CI/CD workflows to avoid disruption. Learn more https://gh.io/all-npm-classic-tokens-revoked
Login at:
https://www.npmjs.com/login?next=/login/cli/fb078c63-d385-4287-b52c-d394ffa2202a
Press ENTER to open in the browser...
Logged in on https://registry.npmjs.org/.
✓ Authenticated as anttiviljami

→ Reading session token from .npmrc...
✓ Session token found

→ Fetching your npm organizations...
✓ Found 3 organization(s)

? Token name/description: npm-keep-me-logged-in-2026-01-19
? Token expiration: 90 days (maximum)
? Select organizations to include: epilot, epilot360
? Bypass 2FA for this token? (not recommended) no

→ Creating granular access token...
  npm will prompt for your password and 2FA code

npm password:
npm notice Security Notice: Classic tokens have been revoked. Granular tokens are now limited to 90 days and require 2FA by default. Update your CI/CD workflows to avoid disruption. Learn more https://gh.io/all-npm-classic-tokens-revoked
Authenticate your account at:
https://www.npmjs.com/auth/cli/865e40dc-b1fa-47e8-91dc-88897fea3219
Press ENTER to open in the browser...
Created token npm_abcdefg123456...

✓ Token created successfully

? Update ~/.yarnrc.yml with the token? (prevents needing to run yarn npm login) yes

→ Updating Yarn configuration...
  Token: npm_abcdefg123456...

  Backup created: /Users/viljami/.yarnrc.yml.backup.2026-01-19T09-14-53-948Z
✓ Updated ~/.yarnrc.yml

✓ All done!
  Token name: npm-keep-me-logged-in-2026-01-19
  Token will expire in 90 days
  Backups of your config files have been created
```

### Token Permissions

Tokens created by this tool have:
- **Read and write access** to all packages
- **Read and write access** to selected organizations
- **Expiration** set to your chosen duration (max 90 days for write access)
- **Optional 2FA bypass** (if you enabled it)

### Duplicate Token Names
If a token with the same name already exists, the tool automatically appends a random 3-character suffix (e.g., `npm-keep-me-logged-in-2026-01-19-a3f`)

## Disclaimer

This tool is not affiliated with npm, Inc. It's a community tool that wraps official npm CLI commands to make token management easier.
