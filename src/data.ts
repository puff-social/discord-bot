import { PermissionFlagsBits, VoiceBasedChannel } from 'discord.js';

import { prisma } from './connectivity/prisma';
import { incrementUserExperience } from './utils/experience';

export const voiceChannelTimers = new Map<string, NodeJS.Timeout[]>();

export function startVoiceChannelTimer(voice: VoiceBasedChannel, user: string) {
  const timer = setInterval(async () => {
    if (!voice || !voice.members.find((mem) => mem.id == user)) {
      console.log('DEBUG: stopping voice timer for', user, 'due to missing channel or channel member');
      clearInterval(timer);
      if (activityTimer) clearInterval(activityTimer);
      voiceChannelTimers.delete(user);

      return;
    }

    // Make sure the voice channel has more than one person
    // Make sure the user is not muted or deafen (or server muted/defeaned)
    // Also make sure the channel is a public voice channel (has permissions to Connect, Speak and speak without PTT)
    // Then increment the XP

    // Keep track of how much xp the user got in that session
    // Keep track of the join time and when we delete the timer send in the voice logs

    if (
      voice.members.size > 1 &&
      !voice.members.find((mem) => mem.id == user)?.voice.mute &&
      !voice.members.find((mem) => mem.id == user)?.voice.deaf &&
      !voice.members.find((mem) => mem.id == user)?.voice.serverMute &&
      !voice.members.find((mem) => mem.id == user)?.voice.serverDeaf &&
      voice.permissionsFor(voice.guild.id).has(PermissionFlagsBits.Connect) &&
      voice.permissionsFor(voice.guild.id).has(PermissionFlagsBits.UseVAD) &&
      voice.permissionsFor(voice.guild.id).has(PermissionFlagsBits.Speak)
    ) {
      console.log('DEBUG: incrementing xp for user', user, 'from voice activity');
      const xpToAdd = Math.floor(Math.random() * 10) + 5;
      await incrementUserExperience(user, xpToAdd);
    }
  }, 10 * 60 * 1000);

  const activityTimer = setInterval(async () => {
    if (
      !voice.members.find((mem) => mem.id == user)?.voice.mute &&
      !voice.members.find((mem) => mem.id == user)?.voice.deaf &&
      !voice.members.find((mem) => mem.id == user)?.voice.serverMute &&
      !voice.members.find((mem) => mem.id == user)?.voice.serverDeaf &&
      voice.permissionsFor(voice.guild.id).has(PermissionFlagsBits.Connect) &&
      voice.permissionsFor(voice.guild.id).has(PermissionFlagsBits.UseVAD) &&
      voice.permissionsFor(voice.guild.id).has(PermissionFlagsBits.Speak)
    )
      await prisma.discord_users.upsert({
        where: { id: user },
        update: {
          ...(voice.members.size > 1 ? { vc_time: { increment: 10 } } : { vc_time_alone: { increment: 10 } }),
        },
        create: {
          id: user,
          ...(voice.members.size > 1 ? { vc_time: 10 } : { vc_time_alone: 10 }),
        },
      });
  }, 10 * 1000);

  voiceChannelTimers.set(user, [timer, activityTimer]);
}
