import { keydb } from '@puff-social/commons/dist/connectivity/keydb';
import { ChannelType, Guild, VoiceChannel } from 'discord.js';

import { startVoiceChannelTimer } from '../data';

export async function processVoiceChannels(guild: Guild) {
  for (const [, channel] of guild.channels.cache.filter((channel) => channel.type == ChannelType.GuildVoice)) {
    if (channel instanceof VoiceChannel) {
      for (const [, member] of channel.members) {
        await keydb.set(`discord/${member.id}/voice`, channel.id);
        startVoiceChannelTimer(channel, member.user.id);
      }
    }
  }
}
