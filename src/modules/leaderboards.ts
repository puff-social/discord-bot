import { APIEmbed, GuildMember, TextChannel } from 'discord.js';

import { client } from '..';
import { NumberEmojis, ProductModelMap, Clouds } from '../constants';
import { env } from '../env';
import { getUsers } from '../hash';

export async function processLeaderboards(leaderboardChannel: TextChannel) {
  try {
    const welcomeMessages = await leaderboardChannel.messages.fetch({ limit: 100 });
    const serverWelcomeMessage = welcomeMessages.find((msg) => msg.embeds?.[0]?.title == 'User Leaderboard for puff.social');

    const {
      data: { users },
    } = await getUsers({ limit: 10 });

    const embedDescription = await Promise.all(
      users.map(async (user, index) => {
        const discordConnection = user.connections.find((connection) => connection.platform == 'discord');

        const guild = client.guilds.resolve(env.WATCH_GUILD);
        const member: GuildMember | null = await guild.members.fetch(discordConnection?.platform_id).catch(() => null);
        const name = member && member.id ? `<@${member.id}>` : user.display_name;
        return `${NumberEmojis[index + 1]}: **${name}** - \`${user.devices
          .sort((b, d) => d.dabs - b.dabs)
          .map((d) => d.dabs)
          .reduce((pre, curr) => pre + curr)
          .toLocaleString()} dabs\`\n${user.devices
          .map((device) => `${user ? `**${device.name}**  -` : ''}*\`${device.dabs.toLocaleString()}\`* ${ProductModelMap[device.model].emoji}`)
          .join('\n')}`;
      }),
    );

    const embed: APIEmbed = {
      title: 'User Leaderboard for puff.social',
      description: embedDescription.join(`\n**${Clouds.start}${Clouds.start2}${Clouds.middle.repeat(embedDescription.length > 3929 ? 1 : 2)}${Clouds.preend}${Clouds.end}**\n`),
      footer: {
        text: 'puff.social user leaderboard - Devices active in the last 28 days',
      },
    };

    if (!serverWelcomeMessage) {
      await leaderboardChannel.send({
        embeds: [embed],
      });
    } else {
      await serverWelcomeMessage.edit({
        embeds: [embed],
      });
    }
  } catch (error) {}
}
