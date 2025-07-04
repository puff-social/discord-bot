import { keydb } from '@puff-social/commons/dist/connectivity/keydb';
import { ChannelType, CommandInteraction, GuildMemberRoleManager, PermissionFlagsBits } from 'discord.js';

import { Channels, Roles, SeshVoiceChannels, DisplayDeviceRolesMap, DeviceRoleColorMap } from '../constants';
import { incrementUserExperience } from '../utils/experience';
import { automaticRelativeDifference } from '../utils/time';
import { setChannelStatus } from '../utils/discord';

export async function seshCommand(data: CommandInteraction, noMention?: boolean) {
  if (!data.channel.permissionsFor(data.guild.id).has(PermissionFlagsBits.ViewChannel)) {
    data.reply({
      embeds: [
        {
          title: 'Error',
          color: 0x213123,
          description: `This command can only be run in public channels, you did want to smoke with people right?\n*Try again in <#${Channels.General}>*`,
          footer: { text: 'puff.social - sesh alerts' },
        },
      ],
      ephemeral: true,
    });
    return;
  }

  if (data.channel.type == ChannelType.GuildVoice) {
    data.reply({
      embeds: [
        {
          title: 'Error',
          color: 0x213123,
          description: `This command can only be run in text channels, whilst this is a public channel it's not the one you should use this command in.\n*Try again in <#${Channels.General}>*`,
          footer: { text: 'puff.social - sesh alerts' },
        },
      ],
      ephemeral: true,
    });
    return;
  }

  const recentlyRun = await keydb.get(`discord/commands/smoke`);
  const userCooldown = await keydb.get(`discord/commands/smoke/${data.user.id}`);
  const userSuspended = await keydb.get(`discord/suspensions/smoke/${data.user.id}`);

  if (userSuspended) {
    data.reply({
      embeds: [
        {
          title: 'Error',
          color: 0xff0000,
          description: `Uh oh, you've been suspended from using this command, due to the following reason:\n\`\`\`\n${userSuspended == 'none' ? 'No reason provided.' : userSuspended}\`\`\`\n\nIf you believe this was a mistake, contact Dustin, however, it's likely not.`,
          footer: { text: 'puff.social - sesh alerts' },
        },
      ],
      ephemeral: true,
    });
    return;
  }

  if (userCooldown) {
    const timeLeft = await keydb.ttl(`discord/commands/smoke/${data.user.id}`);
    const formatter = new Intl.RelativeTimeFormat('en', { style: 'long', numeric: 'always' });

    const format = automaticRelativeDifference(new Date(Number(userCooldown)));
    const formatLeft = automaticRelativeDifference(new Date(Number(new Date().getTime()) + timeLeft * 1000));

    data.reply({
      embeds: [
        {
          title: 'Error',
          color: 0x213123,
          description: `You're run this command too recently, I don't think you would like to be mentioned that frequently, be considerate.\n\nYou last ran this command ${formatter.format(
            format.duration,
            format.unit,
          )}\nYou can run this command again ${formatter.format(formatLeft.duration, formatLeft.unit)}`,
          footer: { text: 'puff.social - sesh alerts' },
        },
      ],
      ephemeral: true,
    });
    return;
  }

  if (recentlyRun) {
    const timeLeft = await keydb.ttl(`discord/commands/smoke`);
    const formatter = new Intl.RelativeTimeFormat('en', { style: 'long', numeric: 'always' });

    const format = automaticRelativeDifference(new Date(Number(recentlyRun)));
    const formatLeft = automaticRelativeDifference(new Date(Number(new Date().getTime()) + timeLeft * 1000));

    data.reply({
      embeds: [
        {
          title: 'Error',
          color: 0x213123,
          description: `This command has been run too recently, I don't think you would like to be mentioned that frequently, be considerate.\n\nSomeone ran this command ${formatter.format(
            format.duration,
            format.unit,
          )}\nYou can run this command again ${formatter.format(formatLeft.duration, formatLeft.unit)}`,
          footer: { text: 'puff.social - sesh alerts' },
        },
      ],
      ephemeral: true,
    });
    return;
  }

  const member = await data.guild.members.fetch(data.user.id);
  if (!member) return;

  if (data.isChatInputCommand() && data.options.get('message')) {
    if (!data.memberPermissions.has(PermissionFlagsBits.ManageMessages))
      return data.reply({
        embeds: [
          {
            title: 'Error',
            color: 0x213123,
            description:
              'You tried to use this command with the `message` parameter, however this parameter is only for use by staff, try this again without adding the message to properly start the sesh.',
            footer: { text: 'puff.social - sesh alerts' },
          },
        ],
        ephemeral: true,
      });

    try {
      setChannelStatus(member.voice.channel.id, (data.options.get('message')?.value as string) ?? 'Sesh');
    } catch (error) {}
  }

  if (!member.roles.resolve(Roles.SeshAlerts.role)) {
    data.reply({
      embeds: [
        {
          title: 'Error',
          color: 0x213123,
          description: `You lack the <@&${Roles.SeshAlerts.role}> role, so how do I know you're actually a sesher?\n\n*head to <#${Channels.Roles}> to get the role*`,
          footer: { text: 'puff.social - sesh alerts' },
        },
      ],
      ephemeral: true,
    });
    return;
  }

  if (!member.voice.channel || !SeshVoiceChannels.includes(member.voice.channel.id)) {
    data.reply({
      embeds: [
        {
          title: 'Error',
          color: 0x213123,
          description: `You must be in one of the voice channels for seshing to use this command and call to your fellow smokers.\n\n${SeshVoiceChannels.map(
            (id) => `<#${id}>`,
          ).join('\n')}`,
          footer: { text: 'puff.social - sesh alerts' },
        },
      ],
      ephemeral: true,
    });
    return;
  }

  const displayRole = Object.values(DisplayDeviceRolesMap).find((role) => member.roles.resolve(role));
  const color = displayRole ? DeviceRoleColorMap[displayRole] : 0xbac221;

  await incrementUserExperience(data.user.id, Math.floor(Math.random() * 5) + 7);

  (await data.deferReply()).delete();
  if (!noMention && data.isChatInputCommand())
    await data.channel.send({
      embeds: [
        {
          color,
          title: 'Time to sesh!',
          author: { name: data.user.username, icon_url: member.displayAvatarURL() },
          description: `${data.user.username} is tryna to get a sesh going, hop on in with them and take some dabs!\n<#${member.voice.channel.id}>`,
          footer: { text: 'puff.social - sesh alerts' },
          timestamp: new Date().toISOString(),
        },
      ],
      content: `<@&${Roles.SeshAlerts.role}>: <@${data.user.id}> is tryna sesh up${data.options.get('message') ? `- ${data.options.get('message')}` : ''}`,
      allowedMentions: {
        roles: [Roles.SeshAlerts.role],
        users: [data.user.id],
      },
    });

  await keydb.set(`discord/commands/smoke`, new Date().getTime(), 'EX', 3600 * 3);
  await keydb.set(`discord/commands/smoke/${data.user.id}`, new Date().getTime(), 'EX', 3600 * 5);
}
