import { ButtonInteraction, ButtonStyle, ComponentType } from 'discord.js';
import { DisplayDeviceRolesMap, AllowedRolesMap, ColorRoles } from '../../constants';

export async function displayDeviceRole(data: ButtonInteraction) {
  const [, roleActionId] = data.customId.split(':');
  const roleId = DisplayDeviceRolesMap[roleActionId];

  const member = await data.guild.members.fetch(data.user.id);

  const matchedRole = AllowedRolesMap[roleId];
  if (!member.roles.resolve(matchedRole.role)) {
    data.reply({
      ephemeral: true,
      embeds: [
        {
          title: 'Error!',
          description: `You've not connected a **${matchedRole.name}** on puff.social whilst in a group to verify you actually have it, get on with that first.`,
          color: 0x123321,
          footer: { text: 'puff.social - roles' },
        },
      ],
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              style: ButtonStyle.Link,
              label: 'Open puff.social',
              emoji: { id: '1090799054428065894', name: 'peak' },
              url: 'https://puff.social',
            },
          ],
        },
      ],
    });

    return;
  }

  await data.deferUpdate();
  if (member.roles.resolve(roleId)) {
    await member.roles.remove(roleId);
  } else {
    await member.roles.add(roleId);

    for await (const role of Object.values(DisplayDeviceRolesMap)) {
      if (role != roleId) await member.roles.remove(role);
    }
  }
}

export async function colorRole(data: ButtonInteraction) {
  const [, color] = data.customId.split(':');
  const colorRole = ColorRoles[color];

  const member = await data.guild.members.fetch(data.user.id);

  await data.deferUpdate();
  if (member.roles.resolve(colorRole.role)) {
    await member.roles.remove(colorRole.role);
  } else {
    await member.roles.add(colorRole.role);

    for await (const { role } of Object.values(ColorRoles).filter(({ role }) => member.roles.resolve(role))) if (role != colorRole.role) await member.roles.remove(role);
  }
}

export async function clearDisplayDeviceRole(data: ButtonInteraction) {
  const member = await data.guild.members.fetch(data.user.id);
  await data.deferUpdate();
  for await (const role of Object.values(DisplayDeviceRolesMap)) await member.roles.remove(role);
}

export async function clearColorRoles(data: ButtonInteraction) {
  const member = await data.guild.members.fetch(data.user.id);
  await data.deferUpdate();
  for await (const { role } of Object.values(ColorRoles).filter(({ role }) => member.roles.resolve(role))) await member.roles.remove(role);
}
