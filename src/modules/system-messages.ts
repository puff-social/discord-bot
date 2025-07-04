import { TextChannel, APIActionRowComponent, ComponentType, ButtonStyle, ActivityType, ActionRow, ButtonComponent, APIButtonComponent } from 'discord.js';

import { client } from '..';
import { Roles, DeviceDisplayButtons, ColorRoles } from '../constants';
import { welcomeEmbed, generalRolesEmbed, devicesRolesEmbed, displayDeviceEmbed, colorRoleEmbed } from '../embeds';
import { env } from '../env';
import { processLeaderboards } from './leaderboards';
import { processDeviceRoles } from './roles';

export async function updateOrSendMessages() {
  const welcomeChannel = await client.channels.fetch(env.WELCOME_CHANNEL);
  if (welcomeChannel instanceof TextChannel) {
    const welcomeMessages = await welcomeChannel.messages.fetch({ limit: 100 });
    const serverWelcomeMessage = welcomeMessages.find((msg) => msg.embeds?.[0]?.title == 'Welcome to puff.social');

    if (!serverWelcomeMessage) {
      await welcomeChannel.send({
        embeds: [welcomeEmbed],
      });
    } else {
      await serverWelcomeMessage.edit({
        embeds: [welcomeEmbed],
      });
    }

    const roleChannel = await client.channels.fetch(env.ROLES_CHANNEL);
    if (roleChannel instanceof TextChannel) {
      const messages = await roleChannel.messages.fetch({ limit: 100 });
      const generalRolesMessage = messages.find((msg) => msg.embeds?.[0]?.title == 'General Roles');

      if (!generalRolesMessage) {
        const message = await roleChannel.send({
          embeds: [generalRolesEmbed],
        });

        await message.react(Roles.SeshAlerts.emoji);
        await message.react(Roles.SiteUpdates.emoji);
        await message.react(Roles.ServerAnnouncements.emoji);
        await message.react(Roles.Giveaways.emoji);
      } else {
        await generalRolesMessage.edit({
          embeds: [generalRolesEmbed],
        });

        if (!generalRolesMessage.reactions.resolve(Roles.SeshAlerts.emoji)) await generalRolesMessage.react(Roles.SeshAlerts.emoji);
        if (!generalRolesMessage.reactions.resolve(Roles.SiteUpdates.emoji)) await generalRolesMessage.react(Roles.SiteUpdates.emoji);
        if (!generalRolesMessage.reactions.resolve(Roles.ServerAnnouncements.emoji)) await generalRolesMessage.react(Roles.ServerAnnouncements.emoji);
        if (!generalRolesMessage.reactions.resolve(Roles.Giveaways.emoji)) await generalRolesMessage.react(Roles.Giveaways.emoji);
      }

      const devicesRolesMessage = messages.find((msg) => msg.embeds?.[0]?.title == 'Show off your device');
      const devicesRolesComponent: APIActionRowComponent<APIButtonComponent> = {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Link,
            label: 'Open puff.social',
            emoji: DeviceDisplayButtons.onyx.emoji,
            url: 'https://puff.social',
          },
        ],
      };
      if (!devicesRolesMessage) {
        await roleChannel.send({
          embeds: [devicesRolesEmbed],
          components: [devicesRolesComponent],
        });
      } else {
        await devicesRolesMessage.edit({
          embeds: [devicesRolesEmbed],
          components: [devicesRolesComponent],
        });
      }

      const displayDeviceRole = messages.find((msg) => msg.embeds?.[0]?.title == 'Display device roles');
      const displayDeviceComponents: APIButtonComponent[] = Object.values(DeviceDisplayButtons).map((dev) => ({
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        label: dev.name,
        emoji: dev.emoji,
        custom_id: `device-role:${dev.action}`,
      }));
      const embedComponents: APIActionRowComponent<APIButtonComponent>[] = [
        {
          type: ComponentType.ActionRow,
          components: [...displayDeviceComponents.slice(0, 5)],
        },
        {
          type: ComponentType.ActionRow,
          components: [...displayDeviceComponents.slice(5, 10)],
        },
        {
          type: ComponentType.ActionRow,
          components: [
            ...displayDeviceComponents.slice(10),
            {
              type: ComponentType.Button,
              style: ButtonStyle.Secondary,
              label: 'None',
              custom_id: `device-role:none`,
            },
          ],
        },
      ];
      if (!displayDeviceRole) {
        await roleChannel.send({
          embeds: [displayDeviceEmbed],
          components: embedComponents,
        });
      } else {
        await displayDeviceRole.edit({
          embeds: [displayDeviceEmbed],
          components: embedComponents,
        });
      }

      const colorRole = messages.find((msg) => msg.embeds?.[0]?.title == 'Choose a Color');
      const colorRoleComponents: APIButtonComponent[] = Object.keys(ColorRoles).map((key) => ({
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        label: ColorRoles[key].name,
        emoji: { name: ColorRoles[key].emoji },
        custom_id: `color-role:${key}`,
      }));
      const colorRoleComponent: APIActionRowComponent<APIButtonComponent>[] = [
        {
          type: ComponentType.ActionRow,
          components: colorRoleComponents.slice(0, 4),
        },
        {
          type: ComponentType.ActionRow,
          components: [
            ...colorRoleComponents.slice(4),
            {
              type: ComponentType.Button,
              style: ButtonStyle.Secondary,
              label: 'None',
              custom_id: `color-role:none`,
            },
          ],
        },
      ];
      if (!colorRole) {
        await roleChannel.send({
          embeds: [colorRoleEmbed],
          components: colorRoleComponent,
        });
      } else {
        await colorRole.edit({
          embeds: [colorRoleEmbed],
          components: colorRoleComponent,
        });
      }
    }

    function presence() {
      client.user.setPresence({
        status: 'online',
        activities: [{ name: 'hash cure', type: ActivityType.Watching }],
      });
    }
    setInterval(presence, 30_000);
    presence();

    const leaderboardChannel = await client.channels.fetch(env.LEADERBOARD_CHANNEL);

    if (leaderboardChannel instanceof TextChannel) {
      setInterval(() => processLeaderboards(leaderboardChannel), 300_000);
      processLeaderboards(leaderboardChannel);
    }

    setInterval(processDeviceRoles, 45_000);
    processDeviceRoles();
  }
}
