import { client } from '..';

import { ProductModelMap } from '../constants';
import { env } from '../env';
import { getUsers } from '../hash';

export async function processDeviceRoles() {
  try {
    const {
      data: { users },
    } = await getUsers();

    for (const user of users) {
      const discordConnection = user.connections.find((connection) => connection.platform == 'discord');
      if (!discordConnection) continue;
      const member = client.guilds.resolve(env.WATCH_GUILD).members.resolve(discordConnection.platform_id);
      if (!member) continue;

      for await (const device of user.devices) {
        const dev = ProductModelMap[device.model];
        if (!dev) continue;
        if (!member.roles.resolve(dev.role)) await member.roles.add(dev.role);
      }
    }
  } catch (error) {}
}
