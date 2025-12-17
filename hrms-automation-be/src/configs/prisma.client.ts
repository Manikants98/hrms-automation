import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

export const getPrisma = (): PrismaClient => {
  if (!prisma) {
    const databaseUrl =
      process.env.PRISMA_DATABASE_URL ||
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL;
    if (!databaseUrl) {
      throw new Error(
        'PRISMA_DATABASE_URL, DATABASE_URL, or POSTGRES_URL environment variable is not set. Please configure one of these in your environment.'
      );
    }

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log:
        process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

    process.on('beforeExit', async () => {
      if (prisma) {
        await prisma.$disconnect();
      }
    });

    process.on('SIGINT', async () => {
      if (prisma) {
        await prisma.$disconnect();
        process.exit(0);
      }
    });

    process.on('SIGTERM', async () => {
      if (prisma) {
        await prisma.$disconnect();
        process.exit(0);
      }
    });
  }
  return prisma;
};

export default new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getPrisma()[prop as keyof PrismaClient];
  },
});
