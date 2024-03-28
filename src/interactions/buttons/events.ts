import { keydb } from "@puff-social/commons/dist/connectivity/keydb";
import { ButtonInteraction, ButtonStyle, ComponentType, NewsChannel } from "discord.js";
import { client } from "../..";
import { Channels } from "../../constants";

export async function attendingEvent(data: ButtonInteraction) {
  const event_id = data.message.id;

  if (!await keydb.exists(`event/attendies/${event_id}/started`)) return;

  if (await keydb.sismember(`event/attendies/${event_id}`, data.user.id))
    return data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Already marked as attending!',
          description: `You're already set yourself as attending, if you want to undo that click the button below.`,
          color: 0xedbac2,
          timestamp: new Date().toISOString(),
          footer: { text: 'puff.social events' },
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

  const welcomeChannel = await client.channels.fetch(Channels.Welcome);
  if (welcomeChannel instanceof NewsChannel) {
    const message = await welcomeChannel.messages.fetch(event_id);
    if (!message) {
      return;
    }

    const keys = await keydb.smembers(`event/attendies/${event_id}`);

    await message.edit({
      embeds: message.embeds, components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              custom_id: 'event:attend',
              emoji: { name: '🎈' },
              label: keys.length.toLocaleString(),
              style: ButtonStyle.Primary,
              type: ComponentType.Button,
            },
          ],
        },
      ]
    });
  }

  data.deferUpdate();
}

export async function unattendEvent(data: ButtonInteraction) {
  const event_id = data.message.id;

  if (!await keydb.exists(`event/attendies/${event_id}/started`)) return;

  await keydb.srem(`event/attendies/${event_id}`, data.user.id);

  const welcomeChannel = await client.channels.fetch(Channels.Welcome);
  if (welcomeChannel instanceof NewsChannel) {
    const message = await welcomeChannel.messages.fetch(event_id);
    if (!message) {
      return;
    }

    const keys = await keydb.smembers(`event/attendies/${event_id}`);

    await message.edit({
      embeds: message.embeds, components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              custom_id: 'event:attend',
              emoji: { name: '🎈' },
              label: keys.length.toLocaleString(),
              style: ButtonStyle.Primary,
              type: ComponentType.Button,
            },
          ],
        },
      ]
    });
  }

  data.deferUpdate();
}