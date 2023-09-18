import { ButtonStyle, ComponentType, ModalSubmitInteraction, NewsChannel } from 'discord.js';

import { prismaDiscord } from '../../connectivity/prisma';
import { Channels } from '../../constants';
import { parseTimeToFutureDate } from '../../utils/time';
import { pika } from '../../pika';
import { client } from '../..';
import { polledGiveaways, processGiveaways } from '../../modules/giveaways';

export async function createGiveawayModal(data: ModalSubmitInteraction) {
  const name = data.fields.getTextInputValue('name');
  const description = data.fields.getTextInputValue('description');
  const winners = Number(data.fields.getTextInputValue('winners'));
  const duration = data.fields.getTextInputValue('duration').toLowerCase();

  const id = pika.gen('giveaway');

  const formattedDuration = parseTimeToFutureDate(duration);
  if (!formattedDuration || isNaN(formattedDuration.getTime())) {
    data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Error',
          description: 'Error creating giveaway, invalid duration provided',
          color: 0xdefeba,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
    });

    return;
  }

  if (formattedDuration.getTime() - new Date().getTime() <= 59 * 1000) {
    data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Error',
          description: 'Error creating giveaway, invalid duration provided, must be greater than 59 seconds.',
          color: 0xdefeba,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
    });

    return;
  }

  const giveaway = {
    id,
    name,
    description,
    winners,
    creator: data.user.id,
    ends: formattedDuration,
  };

  await prismaDiscord.giveaways.create({
    data: giveaway,
  });

  data.reply({
    ephemeral: true,
    embeds: [
      {
        title: 'Giveaway created',
        color: 0x1bacde,
        description: `When you're ready to start and post this in <#${Channels.Giveaways}> use the buttons below`,
        fields: [
          { name: 'Name', value: name, inline: false },
          { name: 'Duration', value: duration, inline: true },
          { name: '_ _', value: '_ _', inline: true },
          { name: 'Ends', value: `<t:${Math.floor(formattedDuration.getTime() / 1000)}:F> <t:${Math.floor(formattedDuration.getTime() / 1000)}:R>`, inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: `ID : ${id}` },
      },
    ],
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            label: 'Start Giveaway',
            emoji: { name: '🎉' },
            custom_id: 'giveaway-create:start',
            style: ButtonStyle.Primary,
          },
          {
            type: ComponentType.Button,
            label: 'Start & Notify',
            emoji: { name: '📣' },
            custom_id: 'giveaway-create:start-announce',
            style: ButtonStyle.Primary,
          },
          {
            type: ComponentType.Button,
            label: 'Delete Giveaway',
            emoji: { name: '🗑️' },
            custom_id: 'giveaway-create:delete',
            style: ButtonStyle.Danger,
          },
        ],
      },
    ],
  });
}

export async function editGiveawayModal(data: ModalSubmitInteraction) {
  const [, id] = data.customId.split(':');
  console.log(id);
  const giveaway = await prismaDiscord.giveaways.findFirst({ where: { id } });
  console.log(giveaway);

  const name = data.fields.getTextInputValue('name');
  const description = data.fields.getTextInputValue('description');
  const winners = Number(data.fields.getTextInputValue('winners'));
  const duration = data.fields.getTextInputValue('duration').toLowerCase();

  const updatedGiveaway: Partial<typeof giveaway> = {};

  if (duration) {
    const formattedDuration = parseTimeToFutureDate(duration);
    if (!formattedDuration || isNaN(formattedDuration.getTime())) {
      data.reply({
        ephemeral: true,
        embeds: [
          {
            title: 'Error',
            description: 'Error creating giveaway, invalid duration provided',
            color: 0xdefeba,
            timestamp: new Date().toISOString(),
            footer: { text: 'puff.social giveaways' },
          },
        ],
      });

      return;
    }

    if (formattedDuration.getTime() - new Date().getTime() <= 59 * 1000) {
      data.reply({
        ephemeral: true,
        embeds: [
          {
            title: 'Error',
            description: 'Error creating giveaway, invalid duration provided, must be greater than 59 seconds.',
            color: 0xdefeba,
            timestamp: new Date().toISOString(),
            footer: { text: 'puff.social giveaways' },
          },
        ],
      });

      return;
    }

    updatedGiveaway.ends = formattedDuration;
  }

  if (name != giveaway.name) updatedGiveaway.name = name;
  if (description != giveaway.description) updatedGiveaway.description = description;
  if (winners != giveaway.winners) updatedGiveaway.winners = winners;

  await prismaDiscord.giveaways.update({
    where: { id: giveaway.id },
    data: updatedGiveaway,
  });

  if (giveaway.message_id) {
    const giveawaysChannel = await client.channels.fetch(Channels.Giveaways);
    if (giveawaysChannel instanceof NewsChannel) {
      const message = await giveawaysChannel.messages.fetch(giveaway.message_id);
      if (!message) {
        console.error('There was an error updating the giveaway message for', giveaway.id, 'failed to locate the original message', giveaway.message_id);
        return;
      }

      const embed = { ...message.embeds[0].data };

      if (name != giveaway.name) embed.title = name;
      if (description != giveaway.description) embed.description = description;

      if (winners != giveaway.winners) {
        const field = embed.fields.find((field) => field.name == 'Winners');
        if (field) field.value = winners.toLocaleString();
      }

      if (updatedGiveaway.ends) {
        const field = embed.fields.find((field) => field.name == 'Ends');
        if (field) field.value = `<t:${Math.floor(updatedGiveaway.ends.getTime() / 1000)}:R> (<t:${Math.floor(updatedGiveaway.ends.getTime() / 1000)}:F>)`;
        const timer = polledGiveaways.get(`giveaways/${giveaway.id}`);
        clearTimeout(timer);
        processGiveaways();
      }

      await message.edit({
        embeds: [embed],
        components: message.components,
      });
    }
  }

  data.reply({
    ephemeral: true,
    embeds: [
      {
        title: 'Giveaway updated',
        color: 0x1bacde,
        description: 'Successfully updated the giveaway',
        timestamp: new Date().toISOString(),
        footer: { text: `ID : ${id}` },
      },
    ],
  });
}
