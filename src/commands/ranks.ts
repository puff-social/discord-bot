import { CommandInteraction } from 'discord.js';

import { prisma } from '../connectivity/prisma';
import { experienceTo } from '../utils/experience';

export async function getRank(data: CommandInteraction) {
  const user = await prisma.discord_users.findFirst({ where: { id: data.user.id } });
  if (!user) {
    data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Error!',
          description: `Unable to find you in the database, get it some time, especially if you just joined.`,
          color: 0x123321,
          footer: { text: 'puff.social - ranks' },
        },
      ],
    });
    return;
  }

  const member = await data.guild.members.fetch(data.user.id);
  if (!member) return;

  data.reply({
    embeds: [
      {
        author: { name: member.displayName, icon_url: member.displayAvatarURL() },
        fields: [
          { name: 'Rank', value: user.level.toString(), inline: true },
          { name: 'EXP', value: `${user.xp.toLocaleString()} / ${(experienceTo(user.level + 1) - 1).toLocaleString()}`, inline: true },
        ],
        footer: { text: 'puff.social - ranks' },
      },
    ],
  });
}
