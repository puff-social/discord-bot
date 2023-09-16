import { ChatInputCommandInteraction, ComponentType, TextInputStyle } from 'discord.js';
import { prismaDiscord } from '../connectivity/prisma';

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
                custom_id: 'boosts',
                label: 'Boosts (Increase entries based on level)',
                required: false,
                style: TextInputStyle.Short,
                max_length: 3,
                min_length: 2,
                value: 'no',
                placeholder: 'no',
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

    case 'delete': {
      break;
    }

    case 'start': {
      break;
    }

    case 'end': {
      break;
    }

    case 'reroll': {
      break;
    }
  }
}
