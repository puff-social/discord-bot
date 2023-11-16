import { ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType } from 'discord.js';

import { Games, startAkinatorGame } from '../helpers/akinator';

export async function akinator(data: ChatInputCommandInteraction) {
  await startAkinatorGame(data);
}

export async function akinatorAnswer(data: ButtonInteraction, option: string) {
  const game = Games.get(data.message.id);

  if (option == "new_game") {
    await startAkinatorGame(data);
    return;
  }

  if (data.user.id != game?.owner) {
      await data.deferUpdate();
      await data.followUp({
        embeds: [
          {
            title: "Not your game!",
            description:
              "This is not your game you can start your own with `/akinator`",
          },
        ],
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Secondary,
                label: "Start new game",
                customId: "akinator:new_game",
              },
            ],
          },
        ],
        ephemeral: true,
      });
      return;
    }

    try {
      if (option == "No" || option == "Yes")
        return await game?.respondToGuess(option, data);

      if (game) await game?.answerQuestion(~~option, data);
    } catch (error) {
      console.log(error);
    }
}