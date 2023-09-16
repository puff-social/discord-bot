import { VoiceChannel } from 'discord.js';

import { client } from '..';
import { VoiceTickers } from '../constants';

export async function updateMembersTicker() {
  const guildMembersTicker = await client.channels.fetch(VoiceTickers.Members);
  if (guildMembersTicker instanceof VoiceChannel) {
    const newName = `${guildMembersTicker.guild.memberCount.toLocaleString()} members`;

    if (guildMembersTicker.name != newName) {
      try {
        await fetch(`https://discord.com/api/v9/channels/${guildMembersTicker.id}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json', authorization: `Bot ${client.token}` },
          body: JSON.stringify({ name: newName }),
        });
      } catch (error) {}
    }
  }
}
