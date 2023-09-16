import { ButtonStyle, ComponentType, ModalSubmitInteraction } from 'discord.js';

import { prismaDiscord } from '../../connectivity/prisma';
import { Channels } from '../../constants';
import { parseTimeToFutureDate } from '../../utils/time';
import { pika } from '../../pika';

export async function createGiveawayModal(data: ModalSubmitInteraction) {
  const name = data.fields.getTextInputValue('name');
  const description = data.fields.getTextInputValue('description');
  const winners = Number(data.fields.getTextInputValue('winners'));
  const duration = data.fields.getTextInputValue('duration').toLowerCase();
  const boosts = data.fields.getTextInputValue('boosts').toLowerCase() == 'yes';

  const id = pika.gen('giveaway');

  const formattedDuration = parseTimeToFutureDate(duration);
  if (!formattedDuration || !formattedDuration.getDate()) {
    data.followUp({
      ephemeral: true,
      embeds: [
        {
          title: 'Error',
          description: 'Error creating giveaway, invalid duration provided',
          color: 0xdefeba,
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
        description: `When you're ready to start and post this in <#${Channels.Giveaways}> run\n\`/giveaways start id:${id}\``,
        fields: [
          { name: 'Name', value: name, inline: false },
          { name: 'Duration', value: duration, inline: true },
          { name: '_ _', value: '_ _', inline: true },
          { name: 'Ends', value: `<t:${Math.floor(formattedDuration.getTime() / 1000)}:F> <t:${Math.floor(formattedDuration.getTime() / 1000)}:R>`, inline: true },
          { name: 'Boosts', value: boosts ? 'Yes' : 'No', inline: false },
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
