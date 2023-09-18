import { keydb } from '@puff-social/commons/dist/connectivity/keydb';
import { ButtonInteraction, ButtonStyle, ComponentType, NewsChannel } from 'discord.js';

import { prismaDiscord } from '../../connectivity/prisma';
import { processGiveaways } from '../../modules/giveaways';
import { client } from '../..';
import { Channels, Roles } from '../../constants';

export async function startGiveaway(data: ButtonInteraction, announce = false) {
  const giveawaysChannel = await client.channels.fetch(Channels.Giveaways);
  if (!(giveawaysChannel instanceof NewsChannel)) return;

  const [, giveaway_id] = data.message.embeds[0].footer.text.split(' : ');
  if (!giveaway_id)
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Failed to start giveaway',
          description: 'Giveaway ID was not found in the message cannot start it.',
          color: 0xedbac2,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
      components: [],
    });

  const giveaway = await prismaDiscord.giveaways.findFirst({ where: { id: giveaway_id } });

  if (!giveaway || giveaway.creator != data.user.id)
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Failed to start giveaway',
          description: `Cannot find giveaway in database or you're not the creator of it.`,
          color: 0xedbac2,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
    });

  if (giveaway.message_id)
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Error',
          description: 'Error starting giveaway, giveaway is already started and has a message id if you want to update the giveaway use the update command.',
          color: 0xdefeba,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
    });

  if (giveaway.ends.getTime() - new Date().getTime() <= 0)
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Error',
          description: 'Error starting giveaway, the end time set on this giveaway has lapsed, please update or recreate the giveaway with a new end date.',
          color: 0xdefeba,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
    });

  await prismaDiscord.giveaways.update({ where: { id: giveaway.id }, data: { draft: false } });

  const message = await giveawaysChannel.send({
    ...(announce ? { content: `<@&${Roles.Giveaways.role}>` } : {}),
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            custom_id: 'giveaway-event:enter',
            emoji: { name: '💝' },
            style: ButtonStyle.Primary,
            type: ComponentType.Button,
          },
        ],
      },
    ],
    embeds: [
      {
        title: giveaway.name,
        description: giveaway.description,
        color: 0xebc1de,
        footer: { text: `puff.social giveaways - ID: ${giveaway.id}` },
        fields: [
          { name: 'Hosted by', value: `<@${giveaway.creator}>`, inline: true },
          { name: 'Winners', value: giveaway.winners.toLocaleString(), inline: true },
          { name: '_ _', value: '_ _', inline: true },
          { name: 'Entries', value: '0', inline: true },
          { name: '_ _', value: '_ _', inline: true },
          { name: '_ _', value: '_ _', inline: true },
          { name: 'Ends', value: `<t:${Math.floor(giveaway.ends.getTime() / 1000)}:R> (<t:${Math.floor(giveaway.ends.getTime() / 1000)}:F>)`, inline: true },
        ],
      },
    ],
  });

  await prismaDiscord.giveaways.update({
    where: { id: giveaway.id },
    data: {
      message_id: message.id,
    },
  });

  processGiveaways();

  return data.reply({
    ephemeral: true,
    embeds: [
      {
        title: 'Giveaway started',
        color: 0xabced1,
        timestamp: new Date().toISOString(),
        description: 'Started the giveaway',
        footer: { text: 'puff.social giveaways' },
      },
    ],
  });
}

export async function deleteGiveaway(data: ButtonInteraction) {
  const [, giveaway_id] = data.message.embeds[0].footer.text.split(' : ');
  if (!giveaway_id)
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Failed to delete giveaway',
          description: 'Giveaway ID was not found in the message cannot delete it.',
          color: 0xedbac2,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
      components: [],
    });

  const giveaway = await prismaDiscord.giveaways.findFirst({ where: { id: giveaway_id } });

  if (!giveaway || giveaway.creator != data.user.id)
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Failed to delete giveaway',
          description: `Cannot find giveaway in database or you're not the creator of it.`,
          color: 0xedbac2,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
    });

  await prismaDiscord.giveaways.delete({ where: { id: giveaway_id } });

  await keydb.del(`giveaways/${giveaway.id}`);

  try {
    if (giveaway.message_id) {
      const giveawaysChannel = await client.channels.fetch(Channels.Giveaways);
      if (giveawaysChannel instanceof NewsChannel) {
        const message = await giveawaysChannel.messages.fetch(giveaway.message_id);
        if (!message) {
          console.error('There was an error ending the giveaway for', giveaway.id, 'failed to locate the original message', giveaway.message_id);
          return;
        }
        await message.delete();
      }
    }
  } catch (error) {}

  return data.reply({
    ephemeral: true,
    embeds: [
      {
        title: 'Giveaway deleted',
        color: 0xedbac2,
        timestamp: new Date().toISOString(),
        description: 'Deleted giveaway as per your request',
        footer: { text: 'puff.social giveaways' },
      },
    ],
  });
}

export async function enterGiveaway(data: ButtonInteraction) {
  const [, giveaway_id] = data.message.embeds[0].footer.text.split('ID: ');
  if (!giveaway_id)
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Failed to enter giveaway',
          description: 'Giveaway ID was not found in the message so we cannot enter it, report this to staff.',
          color: 0xedbac2,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
      components: [],
    });

  const giveaway = await prismaDiscord.giveaways.findFirst({ where: { id: giveaway_id } });

  if (!giveaway)
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Failed to enter giveaway',
          description: `Cannot find giveaway with that ID, report this to staff.`,
          color: 0xedbac2,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
    });

  if (giveaway.ends.getTime() - new Date().getTime() <= 0)
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Failed to enter giveaway',
          description: `Cannot enter giveaway as it's already ended.`,
          color: 0xedbac2,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
    });

  if (giveaway.creator == data.user.id)
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Failed to enter giveaway',
          description: `Cannot enter giveaway as you created it, buddy.`,
          color: 0xedbac2,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
    });

  if (await keydb.hget(`giveaways/${giveaway.id}`, data.user.id))
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Already entered!',
          description: `You're already entered into this giveaway if you want to leave the giveaway click the button below.`,
          color: 0xedbac2,
          timestamp: new Date().toISOString(),
          footer: { text: `puff.social giveaways - ID: ${giveaway.id}` },
        },
      ],
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              style: ButtonStyle.Danger,
              label: 'Leave Giveaway',
              custom_id: 'giveaway-already-entered:leave',
            },
          ],
        },
      ],
    });

  await keydb.hset(`giveaways/${giveaway.id}`, data.user.id, '1');

  const giveawaysChannel = await client.channels.fetch(Channels.Giveaways);
  if (giveawaysChannel instanceof NewsChannel) {
    const message = await giveawaysChannel.messages.fetch(giveaway.message_id);
    if (!message) {
      console.error('There was an error editing the giveaway message to let', data.user.id, 'enter', giveaway.id, 'failed to locate the original message', giveaway.message_id);
      return;
    }

    const keys = await keydb.hkeys(`giveaways/${giveaway.id}`);
    const field = message.embeds[0].fields.find((field) => field.name == 'Entries');
    if (field) field.value = keys.length.toLocaleString();

    await message.edit({ embeds: message.embeds, components: message.components });
  }

  data.deferUpdate();
}

export async function leaveGiveaway(data: ButtonInteraction) {
  const [, giveaway_id] = data.message.embeds[0].footer.text.split('ID: ');
  if (!giveaway_id)
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Failed to leave giveaway',
          description: 'Giveaway ID was not found in the message so we cannot leave it, report this to staff.',
          color: 0xedbac2,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
      components: [],
    });

  const giveaway = await prismaDiscord.giveaways.findFirst({ where: { id: giveaway_id } });

  if (!giveaway)
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Failed to leave giveaway',
          description: `Cannot find giveaway with that ID, report this to staff.`,
          color: 0xedbac2,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
    });

  if (giveaway.ends.getTime() - new Date().getTime() <= 0)
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Failed to leave giveaway',
          description: `Cannot leave giveaway as it's already ended.`,
          color: 0xedbac2,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
    });

  if (!(await keydb.hget(`giveaways/${giveaway.id}`, data.user.id)))
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Failed to leave giveaway',
          description: `Cannot leave giveaway as you're not entered into it.`,
          color: 0xedbac2,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
    });

  await keydb.hdel(`giveaways/${giveaway.id}`, data.user.id);

  const giveawaysChannel = await client.channels.fetch(Channels.Giveaways);
  if (giveawaysChannel instanceof NewsChannel) {
    const message = await giveawaysChannel.messages.fetch(giveaway.message_id);
    if (!message) {
      console.error('There was an error editing the giveaway message to let', data.user.id, 'leave', giveaway.id, 'failed to locate the original message', giveaway.message_id);
      return;
    }

    const keys = await keydb.hkeys(`giveaways/${giveaway.id}`);
    const field = message.embeds[0].fields.find((field) => field.name == 'Entries');
    if (field) field.value = keys.length.toLocaleString();

    await message.edit({ embeds: message.embeds, components: message.components });
  }

  data.deferUpdate();
}
