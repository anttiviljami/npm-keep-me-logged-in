# 🔐 npm-keep-me-logged-in

[![npm version](https://img.shields.io/npm/v/npm-keep-me-logged-in.svg)](https://www.npmjs.com/package/npm-keep-me-logged-in)
[![License](http://img.shields.io/:license-mit-blue.svg)](https://github.com/anttiviljami/npm-keep-me-logged-in/blob/master/LICENSE)
[![Buy me a coffee](https://img.shields.io/badge/donate-buy%20me%20a%20coffee-orange)](https://buymeacoff.ee/anttiviljami)

**Stop running `npm login` every day.** Create long-lived npm access tokens (up to 90 days) and stay logged in to npm without daily authentication prompts.

```sh
npx npm-keep-me-logged-in
```

## The Problem

Since npm deprecated classic tokens, `npm login` tokens now expire after just 24 hours. If you use private npm packages, you're forced to re-authenticate every single day. This is especially frustrating for developers working with private registries and organization packages.

**This tool fixes the npm login expiration problem** by creating proper granular access tokens that last up to 90 days - no more daily `npm login` prompts.

## How It Works

This is a **transparent wrapper** around official npm commands. It automates what you could do manually:

1. Runs `npm login` to create a fresh session
2. Discovers your organizations from published packages
3. Prompts you to configure the token (name, expiration, organizations, 2FA bypass)
4. Runs `npm token create` with your chosen settings (npm handles password/2FA)
5. Optionally updates `~/.yarnrc.yml` with the new token

**Your credentials never leave your machine.** Everything happens locally using official npm CLI commands.

## Security & Privacy

- ✅ **Open source** - Full code transparency
- ✅ **No data collection** - Everything runs locally
- ✅ **No password storage** - Passed directly to npm's official prompt
- ✅ **No file access** - Only reads `~/.npmrc` if you choose to update Yarn config
- ✅ **Official npm commands** - Uses the same `npm token create` you'd use manually
- ✅ **Timestamped backups** - Config files are backed up before modification

## Requirements

- Node.js 18+
- npm 11+ (for granular token CLI support)
- 2FA enabled on your npm account

## Quick Start

Fix your npm login expiration issues in under a minute:

```sh
npx npm-keep-me-logged-in
```

The interactive CLI guides you through:
- **Token name** - Default: `npm-keep-me-logged-in-YYYY-MM-DD`
- **Expiration** - Choose 7, 30, 60, or 90 days (recommended: 90)
- **Organizations** - Auto-detected from your published packages
- **2FA bypass** - Optional (not recommended for security)
- **Yarn config** - Automatically update `~/.yarnrc.yml` (optional)

### What You Get

Long-lived npm authentication tokens with:
- ✅ **90-day expiration** - Stop logging in daily
- ✅ **Read/write access** to all your packages
- ✅ **Organization support** - Works with private org packages
- ✅ **Yarn compatibility** - Auto-configures Yarn Berry if needed
- ✅ **Automatic renewal** - Just run again when token expires

### Notes

- If a token with the same name exists, a random suffix is added (e.g., `npm-keep-me-logged-in-2026-01-19-a3f`)
- Config backups are saved as `~/.npmrc.backup.TIMESTAMP` and `~/.yarnrc.yml.backup.TIMESTAMP`
- You can manage tokens at [npmjs.com/settings/~/tokens](https://npmjs.com/settings/~/tokens)

## License

MIT - This tool is not affiliated with npm, Inc.
