import { NewsChannel } from 'discord.js';
import { client } from '..';
import { prismaDiscord } from '../connectivity/prisma';
import { Channels } from '../constants';
import { randomEntries } from '../utils/random';
import { keydb } from '@puff-social/commons/dist/connectivity/keydb';
import { giveaways } from '../../generated/discord';

export const polledGiveaways = new Map<string, NodeJS.Timeout>();

export async function endGiveaway(giveaway: giveaways, rerolled?: number) {
  const giveawaysChannel = await client.channels.fetch(Channels.Giveaways);
  if (giveawaysChannel instanceof NewsChannel) {
    const message = await giveawaysChannel.messages.fetch(giveaway.message_id);
    if (!message) {
      console.error('There was an error ending the giveaway for', giveaway.id, 'failed to locate the original message', giveaway.message_id);
      return;
    }

    const embed = message.embeds[0];
    const fields = embed.fields.filter((field) => field.name != '_ _');
    for (const field of fields) field.inline = false;

    const keys = await keydb.hkeys(`giveaways/${giveaway.id}`);
    const field = fields.find((field) => field.name == 'Entries');
    if (field) field.value = keys.length.toLocaleString();

    const winners = randomEntries(keys, rerolled ?? giveaway.winners);
    const winnersField = fields.find((field) => field.name == 'Winners');
    if (winnersField) winnersField.value = winners.length ? winners.map((id) => `<@${id}>`).join(', ') : 'No winners';

    const endsField = fields.find((field) => field.name == 'Ends');
    if (endsField) endsField.name = `Ended`;

    await message.edit({
      components: [],
      embeds: [{ ...embed.data, fields, color: 0xdfd1de }],
    });

    if (winners.length)
      await giveawaysChannel.send({
        ...(rerolled
          ? {
              content: `Giveaway was rerolled and ${rerolled > 1 ? `${rerolled.toLocaleString()} more winners were` : 'another winner was'} drawn, congrats to ${winners
                .map((id) => `<@${id}>`)
                .join(', ')}, ${winners.length > 1 ? "y'all" : 'you'} won!`,
            }
          : { content: `Congratulations ${winners.map((id) => `<@${id}>`).join(', ')}, ${winners.length > 1 ? "y'all" : 'you'} won!` }),
        embeds: [
          {
            title: giveaway.name,
            description: giveaway.description,
            color: 0xabced2,
            footer: { text: `puff.social giveaways - ID: ${giveaway.id}` },
            fields: [
              { name: 'Hosted by', value: `<@${giveaway.creator}>`, inline: true },
              { name: 'Winners/Entries', value: `${giveaway.winners.toLocaleString()}/${keys.length.toLocaleString()}`, inline: true },
              { name: '_ _', value: '_ _', inline: true },
            ],
          },
        ],
      });

    await prismaDiscord.giveaways.update({ where: { id: giveaway.id }, data: { ended: true } });
  }
}

export async function processGiveaways() {
  const giveaways = await prismaDiscord.giveaways.findMany({
    where: {
      draft: false,
      ended: false,
      ends: { gte: new Date(), lte: new Date(new Date().getTime() + 5 * 60 * 1000) },
    },
  });

  const filtered = giveaways.filter((item) => !polledGiveaways.has(item.id));

  for (const item of filtered) {
    const diff = item.ends.getTime() - new Date().getTime();
    const timer = setTimeout(async () => {
      endGiveaway(item);
      polledGiveaways.delete(item.id);
    }, diff);

    polledGiveaways.set(item.id, timer);
  }
}

(async () => {
  console.log('Giveaways > Starting poller for giveaways');

  setInterval(() => {
    processGiveaways();
  }, 5 * 60 * 1000); // 5 minutes
  processGiveaways();
})();
