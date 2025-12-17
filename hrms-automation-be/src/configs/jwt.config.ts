export const jwtConfig = {
  secret: process.env.JWT_SECRET || '',
  expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as string,
  refreshExpiresIn: '7d' as string,
};
