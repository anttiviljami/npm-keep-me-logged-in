export interface AuthenticationResult {
  isAuthenticated: boolean;
  username?: string;
}

export interface TokenCreateOptions {
  sessionToken: string;
  tokenName: string;
  expiration: number; // days
  organizations: string[];
  bypass2FA: boolean;
}

export interface TokenCreateResult {
  token: string;
  success: boolean;
  error?: string;
  tokenName?: string;
}

export interface NpmTokenResponse {
  token: string;
  key: string;
  name: string;
  description?: string;
  expiry: string;
  permissions?: {
    packages_and_scopes?: Array<{
      name: string;
      permission: string;
    }>;
    orgs?: Array<{
      name: string;
      permission: string;
    }>;
  };
  scopes?: string[];
  created: string;
  updated: string;
  accessed: string | null;
}
