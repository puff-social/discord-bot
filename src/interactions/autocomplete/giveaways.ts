import { AutocompleteInteraction } from 'discord.js';
import { prismaDiscord } from '../../connectivity/prisma';

export async function giveawaysAutoComplete(data: AutocompleteInteraction) {
  switch (data.options.getSubcommand()) {
    case 'edit':
    case 'delete':
    case 'start':
    case 'end':
    case 'info':
    case 'reroll': {
      const giveaways = await prismaDiscord.giveaways.findMany({
        where:
          data.options.getSubcommand() == 'reroll'
            ? { ended: true, draft: false, ends: { gte: new Date(new Date().getTime() - 1 * 60 * 60 * 1000) } }
            : { ends: { gte: new Date() } },
      });

      const filtered = giveaways.filter((gv) => gv.name.startsWith(data.options.getString('id')));

      data.respond(
        filtered.slice(0, 5).map((gv) => ({
          name: `${gv.name.substring(0, 50)}${gv.name.length >= 50 ? '...' : ''} - ${gv.id}`,
          value: gv.id,
        })),
      );

      break;
    }
  }
}
