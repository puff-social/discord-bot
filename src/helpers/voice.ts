import { Channel, PermissionFlagsBits, TextChannel, VoiceChannel } from 'discord.js';
import { client } from '..';
import { BotRole, VoiceTextChannels, VoiceToText } from '../constants';

export async function changeVoiceText(id: string, user: string) {
  const matchingTextChannel = VoiceToText[id];
  const otherChannels = Object.values(VoiceTextChannels).filter((id) => id != matchingTextChannel);

  for await (const channel of otherChannels) {
    const chan = await client.channels.fetch(channel);
    if (chan instanceof TextChannel) await chan.permissionOverwrites.delete(user);
  }

  if (matchingTextChannel) {
    const chan = await client.channels.fetch(matchingTextChannel);
    if (chan instanceof TextChannel)
      await chan.permissionOverwrites.create(user, {
        ViewChannel: true,
      });
  }
}

export async function switchSoundboardPermissions(oldChannel: Channel, newChannel: Channel, user: string) {
  if (oldChannel && oldChannel instanceof VoiceChannel) await oldChannel.permissionOverwrites.delete(user);

  if ((oldChannel instanceof VoiceChannel) && !oldChannel.permissionsFor(BotRole).has(PermissionFlagsBits.UseSoundboard)) {
    setTimeout(async () => {
      if (newChannel && newChannel instanceof VoiceChannel) await newChannel.permissionOverwrites.create(user, {
        UseSoundboard: true
      });
    }, 1000);
  }

}
