import { keydb } from '@puff-social/commons/dist/connectivity/keydb';
import {
  APIButtonComponent,
  APIButtonComponentWithCustomId,
  ActionRow,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonComponent,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  NewsChannel,
  TextChannel,
} from 'discord.js';

export async function attendingEvent(data: ButtonInteraction) {
  const event_id = data.message.id;

  if (!(await keydb.exists(`event/${event_id}/started`))) return;

  if (await keydb.sismember(`event/attendies/${event_id}`, data.user.id))
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Already marked as attending!',
          description: `You're already set yourself as attending, if you want to undo that click the button below.`,
          color: 0xedbac2,
          timestamp: new Date().toISOString(),
          footer: { text: `puff.social events - ID: ${event_id}` },
        },
      ],
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              style: ButtonStyle.Danger,
              label: 'Unattend',
              custom_id: 'event:unattend',
            },
          ],
        },
      ],
    });

  await keydb.sadd(`event/attendies/${event_id}`, data.user.id);

  const channel = data.channel;
  if (channel instanceof NewsChannel || channel instanceof TextChannel) {
    const message = await channel.messages.fetch(event_id);
    if (!message) {
      return;
    }

    const keys = await keydb.smembers(`event/attendies/${event_id}`);

    const existingRow = new ActionRowBuilder<ButtonBuilder>(message.components[0] as ActionRow<ButtonComponent>);
    if (existingRow) {
      const edited = existingRow.components.filter((comp: ButtonBuilder) => (comp.toJSON() as APIButtonComponentWithCustomId).custom_id != 'event:attend');
      const buttons: APIButtonComponent[] = [];

      // @ts-ignore (someone doesn't know how to write proper types, type says they should all be on the root object but that's untrue asf)
      for (const edit of edited) buttons.push(edit.toJSON().data);

      const targetButton = buttons.find((btn: APIButtonComponentWithCustomId) => btn.custom_id == 'event:attend') as APIButtonComponentWithCustomId;
      if (targetButton) targetButton.label = keys.length.toLocaleString();

      await message.edit({ components: [{ type: 1, components: buttons }] });
    }
  }

  data.deferUpdate();
}

export async function unattendEvent(data: ButtonInteraction) {
  const [, event_id] = data.message.embeds[0].footer.text.split('ID: ');
  if (!event_id)
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Failed to mark status',
          description: 'Could not find the original message for the event notice, report this to staff.',
          color: 0xedbac2,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social giveaways' },
        },
      ],
      components: [],
    });

  if (!(await keydb.exists(`event/${event_id}/started`))) return;

  await keydb.srem(`event/attendies/${event_id}`, data.user.id);

  const channel = data.channel;
  if (channel instanceof NewsChannel || channel instanceof TextChannel) {
    const message = await channel.messages.fetch(event_id);
    if (!message) {
      return;
    }

    const keys = await keydb.smembers(`event/attendies/${event_id}`);

    const existingRow = new ActionRowBuilder<ButtonBuilder>(message.components[0] as ActionRow<ButtonComponent>);
    if (existingRow) {
      const edited = existingRow.components.filter((comp: ButtonBuilder) => (comp.toJSON() as APIButtonComponentWithCustomId).custom_id != 'event:attend');
      const buttons: APIButtonComponent[] = [];

      // @ts-ignore (someone doesn't know how to write proper types, type says they should all be on the root object but that's untrue asf)
      for (const edit of edited) buttons.push(edit.toJSON().data);

      const targetButton = buttons.find((btn: APIButtonComponentWithCustomId) => btn.custom_id == 'event:attend') as APIButtonComponentWithCustomId;
      if (targetButton) targetButton.label = keys.length.toLocaleString();

      await message.edit({ components: [{ type: 1, components: buttons }] });
    }
  }

  data.deferUpdate();
}
