# 🔐 npm-keep-me-logged-in

[![npm version](https://img.shields.io/npm/v/npm-keep-me-logged-in.svg)](https://www.npmjs.com/package/npm-keep-me-logged-in)
[![bundle size](https://img.shields.io/bundlephobia/minzip/npm-keep-me-logged-in?label=gzip%20bundle)](https://www.npmjs.com/package/npm-keep-me-logged-in)
[![License](http://img.shields.io/:license-mit-blue.svg)](https://github.com/anttiviljami/npm-keep-me-logged-in/blob/master/LICENSE)
[![Buy me a coffee](https://img.shields.io/badge/donate-buy%20me%20a%20coffee-orange)](https://buymeacoff.ee/anttiviljami)

**Stop logging into npm every day.** Generate a long-lived granular access token (up to 90 days) and automatically configure your `~/.npmrc` and `~/.yarnrc.yml` files.

```bash
npx npm-keep-me-logged-in
```

## The Problem

After npm deprecated classic tokens, `npm login` now creates tokens that expire after just 24 hours. If you work with private packages, you have to log in every single day. This CLI tool solves that by creating a proper granular access token that lasts up to 90 days.

## What This Tool Does

This is an **interactive CLI wrapper** around the official npm commands. It doesn't do anything you couldn't do manually—it just automates the process and makes it easier. Here's exactly what happens:

### Step-by-Step Process

1. **Runs `npm login`** - Creates a fresh authentication session
2. **Fetches your organizations** - Queries the npm registry API to find organizations you have access to (based on your published scoped packages)
3. **Prompts for token configuration**:
   - Token name (default: `npm-keep-me-logged-in-YYYY-MM-DD`)
   - Expiration (7/30/60/90 days, default 90)
   - Organizations to include (all selected by default)
   - Bypass 2FA option (default: no)
4. **Runs `npm token create`** interactively - npm will prompt you for:
   - Your npm password
   - Your 2FA code
5. **Reads the created token** from `~/.npmrc`
6. **Updates configuration files**:
   - Backs up existing `~/.npmrc` and `~/.yarnrc.yml` (with timestamps)
   - Updates `~/.npmrc` with the new token
   - Updates `~/.yarnrc.yml` with the new token

### What This Tool Does NOT Do

- ❌ **Does not store your password** - It's only used by npm's interactive prompt
- ❌ **Does not send data anywhere** - Everything happens locally using official npm commands
- ❌ **Does not bypass npm security** - It uses the same `npm token create` command you would use manually

## Requirements

- **Node.js 18+** (required for native fetch API)
- **npm v11+** (required for full granular token support with CLI flags)
- **2FA enabled** on your npm account (npm requirement for granular tokens)

## Usage

### Basic Usage

```bash
npx npm-keep-me-logged-in
```

The CLI will guide you through the process with interactive prompts.

### What You'll Be Asked

1. **npm login** - Standard npm login flow (email/username, password, 2FA)
2. **Token name** - Descriptive name for your token (e.g., `npm-keep-me-logged-in-2026-01-19`)
3. **Token expiration** - Choose 7, 30, 60, or 90 days
4. **Organizations** - Select which organizations to include (all selected by default)
5. **Bypass 2FA** - Whether to bypass 2FA for this token (not recommended, default: no)
6. **npm token create** - npm will prompt for your password and 2FA code

### After Running

- ✅ Your `~/.npmrc` is updated with the new token
- ✅ Your `~/.yarnrc.yml` is updated with the new token
- ✅ Backups are created: `~/.npmrc.backup.TIMESTAMP` and `~/.yarnrc.yml.backup.TIMESTAMP`
- ✅ You can now use `npm install` for private packages without logging in daily
- ✅ The token will work for the duration you selected (up to 90 days)

### Token Permissions

Tokens created by this tool have:
- **Read and write access** to all packages
- **Read and write access** to selected organizations
- **Expiration** set to your chosen duration (max 90 days for write access)
- **Optional 2FA bypass** (if you enabled it)

## Troubleshooting

### "npm token create failed"
- Make sure you have npm v11+ installed: `npm --version`
- Ensure 2FA is enabled on your npm account
- Check that you're entering the correct password and 2FA code

### "Could not read token from .npmrc"
- The token creation may have succeeded
- Check your token at: https://npmjs.com/settings/~/tokens
- Manually add it to `~/.npmrc` if needed

### Duplicate Token Names
If a token with the same name already exists, the tool automatically appends a random 3-character suffix (e.g., `npm-keep-me-logged-in-2026-01-19-a3f`)

## Disclaimer

This tool is not affiliated with npm, Inc. It's a community tool that wraps official npm CLI commands to make token management easier.
