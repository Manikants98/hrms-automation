require('dotenv').config();

export const jwtConfig = {
  secret: (process.env.JWT_SECRET || '') as string,
  expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as string,
  refreshExpiresIn: '7d' as string,
};
