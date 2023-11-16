import { ChatInputCommandInteraction, CommandInteraction } from 'discord.js';

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

export async function getLeaderboards(data: ChatInputCommandInteraction) {
  switch (data.options.getSubcommand()) {
    case 'ranks': {
      await data.deferReply();

      const users = await prisma.discord_users.findMany({ orderBy: [{level: 'desc'}, {xp: 'desc'}], take: 20 });
    
      if (!users) {
        data.reply({
          ephemeral: true,
          embeds: [
            {
              title: 'Error!',
              description: `I was unable to pull the users from the database to calculate the leaderboards.`,
              color: 0x123321,
              footer: { text: 'puff.social - ranks' },
            },
          ],
        });
        return;
      }

      const user = await Promise.all(users.map(async (user) => ({
        ...user,
        member: await data.guild.members.fetch(user.id)
      })));

      const board = user.map((user, index) => (`${[index + 1]}. **<@${user.member.id}>** | \`Lvl: ${user.level.toLocaleString()} (${user.xp.toLocaleString()} XP)\``))

      return data.editReply({
        embeds: [{
          title: "Top 20 Discord Users",
          footer: { text: "puff.social - Discord Leaderboards" },
          description: board.join('\n'),
          color: 0xaecd21,
        }]
      });
    }
  }
}
