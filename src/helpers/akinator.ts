import { Aki } from "aki-api";
import { guess } from "aki-api/typings/src/functions";
import {
  ButtonInteraction,
  CommandInteraction,
  Message,
  ComponentType,
  ButtonStyle,
  ButtonComponentData,
} from "discord.js";
import { EventEmitter } from "events";

export interface Game {
  owner: string;
  instance: Aki;
  interaction: CommandInteraction | ButtonInteraction;
  gameMessage: Message;
  offeredGuess: guess;
  activityTimeout: NodeJS.Timeout;
  answers: ("Yes" | "No" | "Don't Know" | "Probably" | "Probably not")[];

  on(event: "end", listener: (reason: string) => void): this;
}

export class Game extends EventEmitter {
  constructor(interaction: CommandInteraction | ButtonInteraction) {
    super();

    this.interaction = interaction;
    this.owner = interaction.user.id;

    // Create new game
    this.instance = new Aki({ region: "en" });
  }

  async init() {
    try {
      await this.interaction.reply({
        embeds: [
          {
            author: {
              name: `${this.interaction.user.globalName}'s Akinator Game`,
              icon_url: this.interaction.user.avatarURL() as string,
            },
            description: "Starting Akinator Game",
            footer: { text: "puff.social - Akinator" },
            color: 0xabc123,
          },
        ],
      });

      const {question, answers} = await this.instance.start();

      const buttons = answers.map(
        (answer, key): ButtonComponentData =>
          ({
            label: answer as string,
            type: ComponentType.Button,
            customId: `akinator:${key.toString()}`,
            style:
              answer == "Yes"
                ? ButtonStyle.Success
                : answer == "No"
                ? ButtonStyle.Danger
                : ButtonStyle.Secondary,
          })
      );

      this.gameMessage = (await this.interaction.editReply({
        embeds: [
          {
            author: {
              name: `${this.interaction.user.globalName}'s Akinator Game`,
              icon_url: this.interaction.user.avatarURL() as string,
            },
            description: `**Q${this.instance.currentStep + 1}**: ${question}`,
            footer: { text: "puff.social - Akinator" },
            color: 0xabbced,
          },
        ],
        components: [{
          type: ComponentType.ActionRow,
          components: buttons
        }],
      })) as Message;

      this.updateActivity();

      return this.gameMessage;
    } catch (error) {}
  }

  async updateActivity() {
    console.log("Updating activity");
    if (this.activityTimeout) clearTimeout(this.activityTimeout);

    this.activityTimeout = setTimeout(() => {
      console.log(
        `Game ${this.gameMessage.id} has been inactive for 5 minutes, ending game`
      );
      this.endGameInactive();
    }, 60000 * 5);
  }

  async offerGuess(guess: guess) {
    const buttons = ["Yes", "No"].map(
      (answer): ButtonComponentData =>
        ({
          label: answer as string,
          type: ComponentType.Button,
          customId: `akinator:${answer}`,
          style: answer == "Yes" ? ButtonStyle.Success : ButtonStyle.Danger,
        })
    );

    this.offeredGuess = guess;

    await this.interaction.editReply({
      embeds: [
        {
          author: {
            name: `${this.interaction.user.globalName}'s Akinator Game`,
            icon_url: this.interaction.user.avatarURL() as string,
          },
          description: `I'm ${(Number(guess.proba) * 100).toFixed(
            2
          )}% sure your character is ${guess.name} (${guess.description})`,
          footer: { text: "puff.social - Akinator" },
          thumbnail: { url: guess.absolute_picture_path },
          color: 0xabde21,
        },
      ],
      components: [{ type: ComponentType.ActionRow, components: buttons }],
    });
  }

  async respondToGuess(
    answer: "Yes" | "No",
    buttonInteraction: ButtonInteraction
  ) {
    if (answer == "No") this.answerQuestion(0, buttonInteraction, true);
    else if (answer == "Yes") {
      await this.interaction.editReply({
        embeds: [
          {
            author: {
              name: `${this.interaction.user.globalName}'s Akinator Game`,
              icon_url: this.interaction.user.avatarURL() as string,
            },
            description: `I'm ${(Number(this.offeredGuess.proba) * 100).toFixed(
              2
            )}% sure your character is ${this.offeredGuess.name} (${
              this.offeredGuess.description
            })`,
            footer: { text: "puff.social - Akinator" },
            thumbnail: { url: this.offeredGuess.absolute_picture_path },
            color: 0xabde21,
          },
          {
            author: {
              name: `${this.interaction.user.globalName}'s Akinator Game`,
              icon_url: this.interaction.user.avatarURL() as string,
            },
            description: `Thanks for playing, it took ${
              this.instance.currentStep + 1
            } questions for me to guess your character.\n\nLet's play again some time soon!`,
            footer: { text: "puff.social - Akinator" },
            color: 0xabbced,
          },
        ],
        components: [
          { type: ComponentType.ActionRow,
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
      });

      this.emit("end", "win");
    }

    this.updateActivity();
    await buttonInteraction.deferUpdate();
  }

  async endGameLose() {
    if (this.activityTimeout) clearTimeout(this.activityTimeout);

    await this.interaction.editReply({
      embeds: [
        {
          author: {
            name: `${this.interaction.user.globalName}'s Akinator Game`,
            icon_url: this.interaction.user.avatarURL() as string,
          },
          description:
            "I tried my hardest but you still won, guess I better keep learning. Good job!",
          footer: { text: "puff.social - Akinator" },
          color: 0xcbde11,
        },
      ],
      components: [{
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
    });

    this.emit("end", "lost");
  }

  async endGameInactive() {
    await this.interaction.editReply({
      embeds: [
        {
          author: {
            name: `${this.interaction.user.globalName}'s Akinator Game`,
            icon_url: this.interaction.user.avatarURL() as string,
          },
          description: "Game inactive for 5 minutes, this game has ended",
          footer: { text: "puff.social - Akinator" },
          color: 0xcbde11,
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
    });

    this.emit("end", "inactivity");
  }

  async answerQuestion(
    answer: number,
    buttonInteraction: ButtonInteraction,
    skipStep?: boolean
  ) {
    if (!skipStep) await buttonInteraction.deferUpdate();

    const step = !skipStep && await this.instance.step(answer as 0 | 1 | 2 | 3 | 4);
    const win = this.instance.progress >= 70 && !skipStep && await this.instance.win();
    if (!skipStep && step && 'answers' in step)
      this.answers = step.answers as (
        | "Yes"
        | "No"
        | "Don't Know"
        | "Probably"
        | "Probably not"
      )[];

    if (win && ('guesses' in win) &&
      win.guesses.length == 1 &&
        (win.guesses as guess[]).find(
          (answer) => Number(answer.proba) * 100 >= 70
        ) &&
      !skipStep
    ) {
      this.offerGuess(win.guesses[0] as guess);
      this.updateActivity();
      return;
    }

    if (this.instance.currentStep + 1 == 80 && !skipStep) {
      this.endGameLose();
      return;
    }

    const buttons = this.answers.map(
      (answer, key): ButtonComponentData =>
        ({
          label: answer as string,
          type: ComponentType.Button,
          customId: `akinator:${key.toString()}`,
          style:
            answer == "Yes"
              ? ButtonStyle.Success
              : answer == "No"
              ? ButtonStyle.Danger
              : ButtonStyle.Secondary,
        })
    );

    await this.interaction.editReply({
      embeds: [
        {
          author: {
            name: `${this.interaction.user.globalName}'s Akinator Game`,
            icon_url: this.interaction.user.avatarURL() as string,
          },
          description: `**Q${this.instance.currentStep + 1}**: ${
            step.question
          }`,
          footer: { text: "puff.social - Akinator" },
          color: 0xabbced,
        },
      ],
      components: [{ type: ComponentType.ActionRow, components: buttons }],
    });

    this.updateActivity();
  }
}

export const Games = new Map<string, Game>();

export async function startAkinatorGame(interaction: CommandInteraction | ButtonInteraction) {
  const game = new Game(interaction);

  try {
    const gameMessage = await game.init();
    if (!gameMessage) {
      await interaction.reply({
        embeds: [
          {
            title: "Failed to create game",
            description: "Failed to create akinator game",
            color: 0xffdf12,
          },
        ],
        ephemeral: true,
      });

      return;
    }
    Games.set(gameMessage.id, game);
    game.on("end", (reason) => {
      console.log(
        `Game by ${game.owner} has ended with reason ${reason} (C: ${gameMessage.channel.id} | Q: ${game.instance.currentStep} | M: ${gameMessage.id})`
      );
      Games.delete(gameMessage.id);
    });
  } catch (error) {}
}