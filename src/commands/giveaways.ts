import { ButtonStyle, ChatInputCommandInteraction, ComponentType, NewsChannel, TextInputStyle } from 'discord.js';
import { prismaDiscord } from '../connectivity/prisma';
import { client } from '..';
import { Channels } from '../constants';
import { endGiveaway, processGiveaways } from '../modules/giveaways';

export async function manageGiveaways(data: ChatInputCommandInteraction) {
  switch (data.options.getSubcommand()) {
    case 'new': {
      data.showModal({
        title: 'New Giveaway',
        custom_id: 'create_giveaway',
        components: [
          {
            type: 1,
            components: [
              {
                type: ComponentType.TextInput,
                custom_id: 'name',
                label: 'Name (Typically the name of the prize)',
                required: true,
                style: TextInputStyle.Short,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: ComponentType.TextInput,
                custom_id: 'duration',
                label: 'Duration (e.g 7 days, 2 weeks, 24h, 2d12h)',
                required: true,
                style: TextInputStyle.Short,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: ComponentType.TextInput,
                custom_id: 'winners',
                label: 'Number of winners',
                required: true,
                placeholder: '1',
                value: '1',
                max_length: 2,
                style: TextInputStyle.Short,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: ComponentType.TextInput,
                custom_id: 'description',
                label: 'Description (Describe the item or product)',
                required: false,
                style: TextInputStyle.Paragraph,
              },
            ],
          },
        ],
      });

      break;
    }

    case 'info': {
      const id = data.options.getString('id');
      const giveaway = await prismaDiscord.giveaways.findFirst({ where: { id } });

      data.reply({
        ephemeral: true,
        embeds: [
          {
            title: 'Giveaway Info',
            color: 0xabcde2,
            footer: { text: `puff.social giveaways - ${giveaway.id}` },
            fields: [
              { name: 'Name', value: giveaway.name, inline: false },
              { name: 'Boosts', value: giveaway.boosts ? 'Yes' : 'No', inline: false },
              { name: 'Creator', value: `<@${giveaway.creator}>`, inline: false },
              { name: 'Ends', value: `<t:${Math.floor(giveaway.ends.getTime() / 1000)}:F> <t:${Math.floor(giveaway.ends.getTime() / 1000)}:R>`, inline: false },
            ],
          },
        ],
      });

      break;
    }

    case 'edit': {
      const id = data.options.getString('id');
      const giveaway = await prismaDiscord.giveaways.findFirst({ where: { id } });

      if (!giveaway || giveaway.creator != data.user.id)
        return data.reply({
          ephemeral: true,
          embeds: [
            {
              title: 'Failed to edit giveaway',
              description: `Cannot find giveaway in database or you're not the creator of it.`,
              color: 0xedbac2,
              timestamp: new Date().toISOString(),
              footer: { text: 'puff.social giveaways' },
            },
          ],
        });

      data.showModal({
        title: 'Edit Giveaway',
        custom_id: `edit_giveaway:${giveaway.id}`,
        components: [
          {
            type: 1,
            components: [
              {
                type: ComponentType.TextInput,
                custom_id: 'name',
                label: 'Name (Typically the name of the prize)',
                required: false,
                style: TextInputStyle.Short,
                value: giveaway.name,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: ComponentType.TextInput,
                custom_id: 'duration',
                label: 'Duration (e.g 7 days, 2 weeks, 24h, 2d12h)',
                required: false,
                style: TextInputStyle.Short,
                placeholder: 'Leave blank to leave unchanged',
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: ComponentType.TextInput,
                custom_id: 'winners',
                label: 'Number of winners',
                required: false,
                placeholder: '1',
                value: giveaway.winners.toString(),
                max_length: 2,
                style: TextInputStyle.Short,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: ComponentType.TextInput,
                custom_id: 'description',
                label: 'Description (Describe the item or product)',
                required: false,
                style: TextInputStyle.Paragraph,
                value: giveaway.description,
              },
            ],
          },
        ],
      });

      break;
    }

    case 'delete': {
      const id = data.options.getString('id');
      const giveaway = await prismaDiscord.giveaways.findFirst({ where: { id } });

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

      break;
    }

    case 'start': {
      const giveawaysChannel = await client.channels.fetch(Channels.Giveaways);
      if (!(giveawaysChannel instanceof NewsChannel)) return;

      const giveaway_id = data.options.getString('id');
      if (!giveaway_id)
        return data.reply({
          ephemeral: true,
          embeds: [
            {
              title: 'Failed to start giveaway',
              description: 'Giveaway ID was not found in your command, so cannot start it.',
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
              title: 'Error',
              description: 'Error starting giveaway, the end time set on this giveaway has lapsed, please update or recreate the giveaway with a new end date.',
              color: 0xedbac2,
              timestamp: new Date().toISOString(),
              footer: { text: 'puff.social giveaways' },
            },
          ],
        });

      await prismaDiscord.giveaways.update({ where: { id: giveaway.id }, data: { draft: false } });

      const message = await giveawaysChannel.send({
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

    case 'end': {
      const giveaway_id = data.options.getString('id');
      if (!giveaway_id)
        return data.reply({
          ephemeral: true,
          embeds: [
            {
              title: 'Failed to end giveaway',
              description: 'Giveaway ID was not found in your command, so cannot end it.',
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
              title: 'Failed to end giveaway',
              description: `Cannot find giveaway in database or you're not the creator of it.`,
              color: 0xedbac2,
              timestamp: new Date().toISOString(),
              footer: { text: 'puff.social giveaways' },
            },
          ],
        });

      if (!giveaway.message_id)
        return data.reply({
          ephemeral: true,
          embeds: [
            {
              title: 'Error',
              description: 'Error ending giveaway, giveaway is already ended and has a message id if you want to update the giveaway use the update command.',
              color: 0xedbac2,
              timestamp: new Date().toISOString(),
              footer: { text: 'puff.social giveaways' },
            },
          ],
        });

      endGiveaway(giveaway);

      return data.reply({
        ephemeral: true,
        embeds: [
          {
            title: 'Giveaway ended',
            color: 0xabced1,
            timestamp: new Date().toISOString(),
            description: 'Ended the giveaway',
            footer: { text: 'puff.social giveaways' },
          },
        ],
      });
    }

    case 'reroll': {
      const amount = data.options.getInteger('amount');
      const giveaway_id = data.options.getString('id');

      if (!giveaway_id)
        return data.reply({
          ephemeral: true,
          embeds: [
            {
              title: 'Failed to reroll giveaway',
              description: 'Giveaway ID was not found in your command, so cannot reroll it.',
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
              title: 'Failed to reroll giveaway',
              description: `Cannot find giveaway in database or you're not the creator of it.`,
              color: 0xedbac2,
              timestamp: new Date().toISOString(),
              footer: { text: 'puff.social giveaways' },
            },
          ],
        });

      if (!giveaway.ended)
        return data.reply({
          ephemeral: true,
          embeds: [
            {
              title: 'Error',
              description: 'Error rerolling giveaway, giveaway is not ended.',
              color: 0xedbac2,
              timestamp: new Date().toISOString(),
              footer: { text: 'puff.social giveaways' },
            },
          ],
        });

      await endGiveaway(giveaway, amount || giveaway.winners);

      return data.reply({
        ephemeral: true,
        embeds: [
          {
            title: 'Giveaway rerolled',
            color: 0xabced1,
            timestamp: new Date().toISOString(),
            description: `Rerolled for ${(amount || giveaway.winners) > 1 ? `${amount || giveaway.winners} other winners` : `another winner`}`,
            footer: { text: 'puff.social giveaways' },
          },
        ],
      });
    }

    case 'boost': {
      // This will only work if the giveaway has not been started
      // can toggle level boosts on or off for a giveaway
      break;
    }
  }
}
