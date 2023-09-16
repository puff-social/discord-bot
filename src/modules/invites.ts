import { keydb } from '@puff-social/commons/dist/connectivity/keydb';
import { Guild } from 'discord.js';

export async function processInvites(guild: Guild) {
  const invites = await guild.invites.fetch();
  for (const [, invite] of invites) {
    await keydb.set(`discord/invites/${invite.code}/uses`, invite.uses);
    if (invite.maxAge) await keydb.expire(`discord/invites/${invite.code}/uses`, invite.maxAge);
  }
}
