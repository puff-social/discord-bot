import { keydb } from '@puff-social/commons/dist/connectivity/keydb';

import {
  Client,
  IntentsBitField,
  TextChannel,
  ButtonInteraction,
  CommandInteraction,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  AutocompleteInteraction,
  NewsChannel,
  ComponentType,
  ButtonStyle,
  DMChannel,
  GuildChannel,
} from 'discord.js';

import { Channels, Roles } from './constants';
import { env } from './env';
import { prisma, prismaDiscord } from './connectivity/prisma';
import { startVoiceChannelTimer, voiceChannelTimers } from './data';

import './api';

import { updateMembersTicker } from './utils/tickers';
import { incrementUserExperience } from './utils/experience';

import './modules/giveaways';
import { getLeaderboards, getRank } from './commands/ranks';
import { seshCommand } from './commands/sesh';
import { manageBirthday } from './commands/birthdays';
import { manageGiveaways } from './commands/giveaways';
import { firmwareGroup } from './commands/firmware';
import { processInvites } from './modules/invites';
import { processVoiceChannels } from './modules/voice';
import { updateOrSendMessages } from './modules/system-messages';
import { clearColorRoles, clearDisplayDeviceRole, colorRole, displayDeviceRole } from './interactions/buttons/roles';
import { createGiveawayModal, editGiveawayModal } from './interactions/modals/giveaways';
import { deleteGiveaway, enterGiveaway, leaveGiveaway, startGiveaway } from './interactions/buttons/giveaways';
import { giveawaysAutoComplete } from './interactions/autocomplete/giveaways';
import { changeVoiceText, switchSoundboardPermissions } from './helpers/voice';
import { akinator, akinatorAnswer } from './commands/akinator';
import { invalidChannel } from './commands/utils';

export const client = new Client({
  intents:
    IntentsBitField.Flags.GuildMembers |
    IntentsBitField.Flags.GuildMessages |
    IntentsBitField.Flags.MessageContent |
    IntentsBitField.Flags.Guilds |
    IntentsBitField.Flags.MessageContent |
    IntentsBitField.Flags.GuildMessageReactions |
    IntentsBitField.Flags.GuildVoiceStates |
    IntentsBitField.Flags.GuildInvites,
});

client.on('ready', async () => {
  console.log(`Discord > Connected as ${client.user.username}`);

  const guild = await client.guilds.fetch(env.WATCH_GUILD);
  if (!guild) return;

  setInterval(updateMembersTicker, 300_000);
  updateMembersTicker();

  updateOrSendMessages();
  processInvites(guild);
  processVoiceChannels(guild);
});

client.on('inviteCreate', async (invite) => {
  if (invite.guild.id != env.WATCH_GUILD) return;

  await keydb.set(`discord/invites/${invite.code}/uses`, invite.uses);
  if (invite.maxAge) await keydb.expire(`discord/invites/${invite.code}/uses`, invite.maxAge);
});

client.on('guildMemberAdd', async (member) => {
  if (member.guild.id != env.WATCH_GUILD) return;

  const invites = await member.guild.invites.fetch();

  const used = (
    await Promise.all(
      invites.toJSON().map(async (invite) => {
        const redisInvite = await keydb.get(`discord/invites/${invite.code}/uses`);
        if (redisInvite && Number(redisInvite) != invite.uses) return invite;
      }),
    )
  ).filter((defined) => defined)[0];

  if (used) {
    await keydb.incr(`discord/invites/${used.code}/uses`);

    const alreadyUsed = await keydb.get(`discord/invite/${used.code}/used-by/${member.user.id}`);
    if (!alreadyUsed) {
      await prisma.discord_users.upsert({
        where: { id: used.inviter.id },
        update: {
          invites: {
            increment: 1,
          },
        },
        create: {
          id: used.inviter.id,
          invites: 1,
        },
      });
      await incrementUserExperience(used.inviter.id, Math.floor(Math.random() * 5) + 15);
      await keydb.set(`discord/invite/${used.code}/used-by/${member.user.id}`, new Date().getTime());
    }
  }
});

client.on('guildMemberRemove', async (member) => {
  const runningGiveaways = await prismaDiscord.giveaways.findMany({ where: { ended: false, draft: false } });

  for (const giveaway of runningGiveaways) {
    const entries = await keydb.hkeys(`giveaways/${giveaway.id}`);
    if (entries.includes(member.id)) {
      await keydb.hdel(`giveaways/${giveaway.id}`, member.id);

      const giveawaysChannel = await client.channels.fetch(Channels.Giveaways);
      if (giveawaysChannel instanceof NewsChannel) {
        const message = await giveawaysChannel.messages.fetch(giveaway.message_id);
        if (!message) {
          console.error('There was an error editing the giveaway message to let', member.id, 'leave', giveaway.id, 'failed to locate the original message', giveaway.message_id);
          return;
        }

        const keys = await keydb.hkeys(`giveaways/${giveaway.id}`);
        const field = message.embeds[0].fields.find((field) => field.name == 'Entries');
        if (field) field.value = keys.length.toLocaleString();

        await message.edit({
          embeds: message.embeds,
          components: [
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  custom_id: 'giveaway-event:enter',
                  emoji: { name: '💝' },
                  label: keys.length.toLocaleString(),
                  style: ButtonStyle.Primary,
                  type: ComponentType.Button,
                },
              ],
            },
          ],
        });
      }
    }
  }

  // Delete the user and their level from the database, they literally don't serve to be here.
  await prisma.discord_users.delete({ where: { id: member.user.id } });
});

client.on('guildMemberUpdate', async (oldMember, member) => {
  if (
    member.nickname.startsWith('!') &&
    member.nickname != member.user.displayName
  ) member.setNickname(member.nickname.replace(/^!+(?=[a-zA-Z])/, ''))
});

client.on('messageReactionAdd', async (data, reactor) => {
  (async () => {
    if (data.message.attachments.size > 0 && reactor.id != data.message.author.id) {
      const users = (await data.users.fetch()).filter((usr) => usr.id != data.message.author.id);
      if (!(data.message.channel instanceof TextChannel)) return;
      const alreadyInteracted = await keydb.get(`discord/reaction_messages/${data.message.id}`);

      if (users.size > 0 && !alreadyInteracted && data.message.channel.permissionsFor(data.message.guild.id).has(PermissionFlagsBits.ViewChannel)) {
        await keydb.set(`discord/reaction_messages/${data.message.id}`, reactor.id);
        await incrementUserExperience(data.message.author.id, 5);
      }
    }
  })();

  if (data.message.channel.id != env.ROLES_CHANNEL) return;

  const entry = Object.values(Roles).find((item) => item.emoji == data.emoji.name);
  const member = await data.message.guild.members.fetch(reactor.id);

  if (entry && !member.roles.resolve(entry.role)) member.roles.add(entry.role);
});

client.on('messageReactionRemove', async (data, reactor) => {
  if (data.message.channel.id != env.ROLES_CHANNEL) return;

  const entry = Object.values(Roles).find((item) => item.emoji == data.emoji.name);
  const member = await data.message.guild.members.fetch(reactor.id);

  if (entry && member.roles.resolve(entry.role)) member.roles.remove(entry.role);
});

client.on('interactionCreate', async (data) => {
  if (data instanceof ButtonInteraction) {
    switch (data.customId) {
      case 'device-role:puffco-peak-pro':
      case 'device-role:puffco-opal':
      case 'device-role:puffco-indiglow':
      case 'device-role:puffco-guardian':
      case 'device-role:puffco-pearl':
      case 'device-role:puffco-onyx':
      case 'device-role:puffco-desert':
      case 'device-role:puffco-flourish':
        displayDeviceRole(data);
        break;
      case 'device-role:none':
        clearDisplayDeviceRole(data);
        break;

      case 'color-role:purple':
      case 'color-role:blue':
      case 'color-role:green':
      case 'color-role:yellow':
      case 'color-role:orange':
      case 'color-role:red':
      case 'color-role:brown':
        colorRole(data);
        break;
      case 'color-role:none':
        clearColorRoles(data);
        break;

      case 'giveaway-create:start':
        startGiveaway(data);
        break;
      case 'giveaway-create:start-announce':
        startGiveaway(data, true);
        break;
      case 'giveaway-create:delete':
        deleteGiveaway(data);
        break;
      case 'giveaway-event:enter':
        enterGiveaway(data);
        break;
      case 'giveaway-already-entered:leave':
        leaveGiveaway(data);
        break;

      default: {
        if (!data.customId.includes(':')) return;

        const [prefix, argument] = data.customId.split(':');

        switch (prefix) {
          case 'akinator':
            akinatorAnswer(data, argument);
            break;

          default:
            break;
        }
      }
    }
  } else if (data instanceof ModalSubmitInteraction) {
    switch (data.customId.split(':')[0]) {
      case 'create_giveaway':
        createGiveawayModal(data);
        break;

      case 'edit_giveaway':
        editGiveawayModal(data);
        break;
    }
  } else if (data instanceof CommandInteraction) {
    switch (data.commandName) {
      case 'sesh':
      case 'smoke':
        seshCommand(data);
        break;

      case 'seshee':
        seshCommand(data, true);
        break;

      case 'rank':
        getRank(data);
        break;

      case 'leaderboards':
        getLeaderboards(data as ChatInputCommandInteraction);
        break;

      case 'birthday':
        manageBirthday(data as ChatInputCommandInteraction);
        break;

      case 'firmware':
        firmwareGroup(data as ChatInputCommandInteraction);
        break;

      case 'giveaways':
        manageGiveaways(data as ChatInputCommandInteraction);
        break;

      case 'akinator':
        if (data.channel.id == Channels.RanksNBots)
          akinator(data as ChatInputCommandInteraction);
        else
          invalidChannel(Channels.RanksNBots, data);
        break;
    }
  } else if (data instanceof AutocompleteInteraction) {
    switch (data.commandName) {
      case 'giveaways':
        giveawaysAutoComplete(data as AutocompleteInteraction);
    }
  }
});

client.on('messageUpdate', async (old, msg) => {
  if (msg.author.bot) return;
  if (!(msg.channel instanceof GuildChannel)) return;
  if (msg.cleanContent == old.cleanContent) return;
  if (!msg.channel.permissionsFor(msg.guild.id).has(PermissionFlagsBits.ViewChannel)) return;

  const logsChannel = await client.channels.fetch(Channels.ChatLogs);
  if (!(logsChannel instanceof TextChannel)) return;

  logsChannel.send({
    embeds: [
      {
        author: { name: msg.author.globalName, icon_url: msg.author.avatarURL() },
        url: `https://discord.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}`,
        description: `Old:\n\`\`\`\n${(old.cleanContent ?? 'N/A').substring(0, 1024)}\n\`\`\`\n\n**New**:\n\`\`\`\n${(msg.cleanContent ?? 'N/A').substring(0, 1024)}\n\`\`\``,
        fields: [
          { name: 'Where', value: `<#${msg.channel.id}>` },
          { name: 'ID', value: `\`${msg.id}\`` },
        ],
        color: 0x1aa7ec,
        footer: { text: 'puff.social logs - Message Updated' },
      },
    ],
  });
});

client.on('messageDelete', async (msg) => {
  if (msg.author.bot) return;
  if (!(msg.channel instanceof GuildChannel)) return;
  if (!msg.channel.permissionsFor(msg.guild.id).has(PermissionFlagsBits.ViewChannel)) return;

  const logsChannel = await client.channels.fetch(Channels.ChatLogs);
  if (!(logsChannel instanceof TextChannel)) return;

  logsChannel.send({
    embeds: [
      {
        author: { name: msg.author.globalName, icon_url: msg.author.avatarURL() },
        description: `Content:\n\`\`\`\n${msg.cleanContent}\n\`\`\``,
        fields: [
          { name: 'Where', value: `<#${msg.channel.id}>` },
          { name: 'ID', value: `\`${msg.id}\`` },
        ],
        color: 0xff0000,
        footer: { text: 'puff.social logs - Message Deleted' },
      },
    ],
  });
});

client.on('messageCreate', async (msg) => {
  if (!msg.author.bot && msg.guild) {
    if (!(msg.channel instanceof TextChannel)) return;
    const attachment = msg.attachments.size > 0;
    const xpToAdd = Math.floor(Math.random() * (attachment ? 14 : 7)) + (attachment ? 16 : 8);

    if (msg.channel.permissionsFor(msg.guild.id).has(PermissionFlagsBits.ViewChannel)) {
      await prisma.discord_users.upsert({
        where: { id: msg.author.id },
        update: {
          messages: {
            increment: 1,
          },
        },
        create: {
          id: msg.author.id,
          messages: 1,
        },
      });

      const lastMessage = await msg.channel.messages.fetch({ limit: 2, cache: false });
      const lastUserMessage = lastMessage.filter((m) => m.author.id === msg.author.id).last();

      if (lastUserMessage && Date.now() - lastUserMessage.createdTimestamp < 5000) return;
      await incrementUserExperience(msg.author.id, xpToAdd);
    }
  }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  if (newState.member?.user.bot) return;

  if (oldState.channel != newState.channel) changeVoiceText(newState.channel?.id, newState.member.user.id);
  if (oldState.channel != newState.channel) switchSoundboardPermissions(oldState.channel, newState.channel, newState.member.user.id);

  if (oldState.channel != newState.channel && newState.channel) {
    await keydb.set(`discord/${newState.member.id}/voice`, newState.channel.id);
    startVoiceChannelTimer(newState.channel, newState.member.id);

    let link: string;
    try {
      const invites = await newState.channel.fetchInvites();
      if (!invites.first()) link = `https://discord.gg/${(await newState.channel.createInvite({ maxAge: 0 })).code}`;
      link = `https://discord.gg/${invites.first().code}`;
    } catch (error) { }

    const user = await prisma.users.findFirst({ include: { connections: true }, where: { connections: { some: { platform_id: newState.member.id, platform: 'discord' } } } });
    fetch(`${env.GATEWAY_HOST}/user/${user?.id}/update`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ voice: { id: newState.channel.id, name: newState.channel.name, link } }),
    }).catch(console.error);
  } else if (oldState.channel != newState.channel && oldState.channel && !newState.channel) {
    await keydb.del(`discord/${oldState.member.id}/voice`);

    const user = await prisma.users.findFirst({ include: { connections: true }, where: { connections: { some: { platform_id: oldState.member.id, platform: 'discord' } } } });
    fetch(`${env.GATEWAY_HOST}/user/${user?.id}/update`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ voice: null }),
    }).catch(console.error);

    const timer = voiceChannelTimers.get(oldState.member.id);
    if (timer) {
      for (const t of timer) clearInterval(t);
      voiceChannelTimers.delete(oldState.member.id);
    }
  }
});

client.login(env.DISCORD_TOKEN);
