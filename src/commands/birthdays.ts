import { ChatInputCommandInteraction } from 'discord.js';

import { prisma } from '../connectivity/prisma';

export async function manageBirthday(data: ChatInputCommandInteraction) {
  switch (data.options.getSubcommand()) {
    case 'set': {
      const month = data.options.get('month').value as number;
      const day = data.options.get('day').value as number;

      if (month < 1 || month > 12) {
        data.reply({
          ephemeral: true,
          embeds: [
            {
              title: 'Error',
              description: 'Invalid month given, must be within 1-12',
              color: 0xfbac2d,
              footer: { text: 'puff.social - birthday' },
            },
          ],
        });

        return;
      }

      const date = `${month}/${day}`;
      if (isNaN(new Date(date).getTime())) {
        data.reply({
          ephemeral: true,
          embeds: [
            {
              title: 'Error',
              description: 'Invalid day/month combination was given',
              color: 0xfbac2d,
              footer: { text: 'puff.social - birthday' },
            },
          ],
        });

        return;
      }

      await prisma.discord_users.upsert({
        create: {
          id: data.member.user.id,
          birthday: date,
        },
        where: {
          id: data.member.user.id,
        },
        update: {
          birthday: date,
        },
      });

      data.reply({
        ephemeral: true,
        embeds: [
          {
            title: 'Birthday set!',
            color: 0x283bac,
            description: `Your birthday has been set to **${date}**`,
            footer: { text: 'puff.social - birthday' },
          },
        ],
      });

      break;
    }
    case 'delete': {
      const current = await prisma.discord_users.findFirst({ where: { id: data.member.user.id } });

      if (!current || !current.birthday) {
        data.reply({
          ephemeral: true,
          embeds: [
            {
              title: 'Error',
              description: 'You never had a birthday set, you can set one with `/birthday set` if you want to set one!',
              color: 0xfbac2d,
              footer: { text: 'puff.social - birthday' },
            },
          ],
        });

        return;
      }

      await prisma.discord_users.update({ where: { id: data.member.user.id }, data: { birthday: null } });

      data.reply({
        ephemeral: true,
        embeds: [
          {
            title: 'Birthday removed!',
            description: `Your birthday has been unset, you can always set it up again with \`/birthday set\`.`,
            color: 0xfbac2d,
            footer: { text: 'puff.social - birthday' },
          },
        ],
      });

      break;
    }
  }
}
