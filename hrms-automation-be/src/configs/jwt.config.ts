export const jwtConfig = {
  secret:
    (process.env.JWT_SECRET as string) ||
    'your-secret-key-change-in-production',
  expiresIn: (process.env.JWT_EXPIRES_IN as string) || '24h',
  refreshExpiresIn: '7d' as const,
};
