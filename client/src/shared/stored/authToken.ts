let accessTokenCache: string | null = null;

export function setAccessToken(token: string | null) {
  accessTokenCache = token ?? null;
}

export function getAccessToken(): string | null {
  return accessTokenCache;
}
