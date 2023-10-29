import { TextChannel } from 'discord.js';
import { client } from '..';
import { VoiceTextChannels, VoiceToText } from '../constants';

export async function changeVoiceText(id: string, user: string) {
  const matchingTextChannel = VoiceToText[id];
  console.log(matchingTextChannel, 1);
  const otherChannels = Object.values(VoiceTextChannels).filter((id) => id != matchingTextChannel);
  console.log(otherChannels, 2);

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
