import { ButtonInteraction } from 'discord.js';
import { prismaDiscord } from '../../connectivity/prisma';

export async function startGiveaway(data: ButtonInteraction) {
  return;
}

export async function deleteGiveaway(data: ButtonInteraction) {
  const [, giveaway_id] = data.message.embeds[0].footer.text.split(' : ');
  if (!giveaway_id)
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Failed to delete giveaway',
          description: 'Giveaway ID was not found in the message cannot delete it.',
          color: 0xedbac2,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
      components: [],
    });

  const giveaway = await prismaDiscord.giveaways.findFirst({ where: { id: giveaway_id } });

  if (!giveaway || giveaway.creator != data.user.id)
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Failed to delete giveaway',
          description: `Cannot find giveaway in database or you're not the creator of it.`,
          color: 0xedbac2,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
    });

  await prismaDiscord.giveaways.delete({ where: { id: giveaway_id } });

  return data.reply({
    ephemeral: true,
    embeds: [
      {
        title: 'Giveaway deleted',
        color: 0xedbac2,
        timestamp: new Date().toISOString(),
        description: 'Deleted giveaway as per your request',
        footer: { text: 'puff.social giveaways' },
      },
    ],
  });
}

export async function enterGiveaway(data: ButtonInteraction) {
  return;
}

export async function leaveGiveaway(data: ButtonInteraction) {
  return;
}
