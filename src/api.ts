import { VoiceChannel, PermissionFlagsBits } from 'discord.js';
import fastify, { FastifyRequest } from 'fastify';

import { client } from '.';

import { env } from './env';

const server = fastify();

server.get('/channels/:id', async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
  const cached = client.channels.cache.get(req.params.id);
  if (cached && cached instanceof VoiceChannel) {
    let link: string;
    if (cached.permissionsFor(cached.guild.id).has(PermissionFlagsBits.Connect)) {
      const invites = await cached.fetchInvites();
      if (!invites.first()) link = `https://discord.gg/${(await cached.createInvite({ maxAge: 0 })).code}`;
      link = `https://discord.gg/${invites.first().code}`;
    }

    return res.status(200).send({
      id: cached.id,
      name: cached.name,
      link,
    });
  }

  const channel = await client.channels.fetch(req.params.id);
  if (!channel || !(channel instanceof VoiceChannel)) return res.status(404).send();
  let link: string;
  if (channel.permissionsFor(channel.guild.id).has(PermissionFlagsBits.Connect)) {
    const invites = await channel.fetchInvites();
    if (!invites.first()) link = `https://discord.gg/${(await channel.createInvite({ maxAge: 0 })).code}`;
    link = `https://discord.gg/${invites.first().code}`;
  }

  return res.status(200).send({
    id: channel.id,
    name: channel.name,
    link,
  });
});

server.listen({ port: env.PORT, host: '0.0.0.0' }, () => {
  console.log(`API > Internal API listening on ${env.PORT}`);
});
