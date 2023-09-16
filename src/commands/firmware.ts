import { ChatInputCommandInteraction } from 'discord.js';

import { pika } from '../pika';
import { prisma } from '../connectivity/prisma';
import { Channels } from '../constants';

export async function firmwareGroup(data: ChatInputCommandInteraction) {
  switch (data.options.getSubcommand()) {
    case 'notify': {
      const serial = data.options.get('serial').value as string;

      const id = pika.gen('watch');
      await prisma.firmware_watches.create({
        data: {
          id,
          serial,
          user: data.user.id,
        },
      });

      data.reply({
        ephemeral: true,
        embeds: [
          {
            title: 'Notifications set',
            color: 0xabc121,
            description: `Notifications turned on for latest firmware updates, you'll be notified in <#${Channels.FirmwareUpdates}> when an update to the latest known firmware is found.`,
            footer: { text: `${id} - puff.social - firmware updates` },
          },
        ],
      });

      break;
    }
  }
}
