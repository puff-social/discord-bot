import { PrismaClient } from '../../generated/puff';
import { PrismaClient as DiscordPrisma } from '../../generated/discord';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export const prismaDiscord = new DiscordPrisma({
  datasources: {
    db: {
      url: process.env.DISCORD_DATABASE_URL,
    },
  },
});
