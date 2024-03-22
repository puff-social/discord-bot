import { client } from "..";

export async function setChannelStatus(channel: string, status: string) {
  const req = await fetch(`https://discord.com/api/v9/channels/${channel}/voice-status`, {
    method: 'PUT',
    headers: { authorization: `Bot ${client.token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ status })
  });

  if (req.status != 204) throw 'failed';

  return;
}