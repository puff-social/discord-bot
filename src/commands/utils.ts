import { CommandInteraction, Interaction } from "discord.js";

export async function invalidChannel(allowedChannel: string, data: CommandInteraction) {
  data.reply({
    ephemeral: true,
    embeds: [
      {
        title: 'Invalid Channel',
        description: `You cannot run this command in this channel, this command is only able to run in <#${allowedChannel}>`,
        color: 0xabcde2,
        footer: { text: `puff.social` },
      },
    ],
  });
}