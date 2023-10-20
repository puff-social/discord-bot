import { TextChannel } from 'discord.js';
import { keydb } from '@puff-social/commons/dist/connectivity/keydb';

import { client } from '..';
import { prisma } from '../connectivity/prisma';
import { Channels, DeviceRoleColorMap, DisplayDeviceRolesMap, RankRoles } from '../constants';

export function experienceTo(level: number) {
  return new Array(level)
    .fill(level)
    .map((_, i) => 100 * i + 75)
    .reduce((c, p) => c + p);
}

export function calculateLevel(xp: number) {
  let level = 0,
    accumulatedXp = 0;

  while (xp >= accumulatedXp) {
    accumulatedXp += 100 * level + 75;
    level++;
  }

  return level - 1;
}

export async function incrementUserExperience(id: string, amount = 1, message = false) {
  const user = await prisma.discord_users.findFirst({ where: { id } });

  const lastGiven = await keydb.get(`discord/experience/${id}/last`);
  if (lastGiven) return;

  const newUser = await prisma.discord_users.upsert({
    where: { id },
    update: {
      xp: {
        increment: amount,
      },
    },
    create: {
      id,
      xp: amount,
    },
  });

  await keydb.set(`discord/experience/${id}/last`, new Date().getTime().toString(), 'EX', 60);

  if (user && newUser.level > user.level) {
    const channel = await client.channels.fetch(Channels.RanksNBots);
    if (!(channel instanceof TextChannel)) return;

    const member = await channel.guild.members.fetch(id);
    if (!member) return;

    const displayRole = Object.values(DisplayDeviceRolesMap).find((role) => member.roles.resolve(role));
    const color = displayRole ? DeviceRoleColorMap[displayRole] : 0xabc1ac;

    let rankRole = RankRoles[newUser.level];
    if (!rankRole) {
      const levels = Object.keys(RankRoles)
        .map(Number)
        .sort((a, b) => b - a);
      for (const l of levels) {
        if (newUser.level >= l) {
          rankRole = RankRoles[l];
          break;
        }
      }
    }

    let previousRankRole = RankRoles[user.level];
    if (!previousRankRole) {
      const levels = Object.keys(RankRoles)
        .map(Number)
        .sort((a, b) => b - a);
      for (const l of levels) {
        if (user.level >= l) {
          previousRankRole = RankRoles[l];
          break;
        }
      }
    }

    await channel.send({
      embeds: [
        {
          color,
          title: 'Leveled up!',
          author: { name: member.displayName, icon_url: member.displayAvatarURL() },
          description: `<@${id}> you just reached level **${newUser.level}**!\nCongratulations! 🎉 🎉${
            !member.roles.resolve(rankRole.id) ? `\nYou were assigned the <@&${rankRole.id}> role` : ''
          }`,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social - ranks' },
        },
      ],
    });

    if (!member.roles.resolve(rankRole.id)) await member.roles.add(rankRole.id);
    if (rankRole?.id != previousRankRole?.id) await member.roles.remove(previousRankRole.id);
  }
}

export async function incrementSessionExperience(id: string, amount = 1) {
  await keydb.set(`discord/experience/${id}/session`, new Date().getTime().toString(), 'EX', 60);
}
