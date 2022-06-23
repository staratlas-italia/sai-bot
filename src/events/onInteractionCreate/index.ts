import { GuildMember, Interaction, TextChannel } from "discord.js";
import { push } from "~/commands/push";
import { referral } from "~/commands/referral";
import { fetchMember } from "~/queries/fetchMember";
import { Command, PushCommandStatus } from "~/types";
import { checkPermission } from "~/utils/checkPermission";

export const onInteractionCreate = async (interaction: Interaction) => {
  if (!interaction.isCommand()) {
    console.log("Command not found");
    return;
  }

  const { commandName, options } = interaction;

  const author: GuildMember = interaction.member as GuildMember;

  if (!author) {
    console.log("Author who interacted is invalid");
    return;
  }

  // Consent to reply in ~15 minutes instead of 3 seconds
  await interaction.deferReply({ ephemeral: true });

  if (!checkPermission({ author, commandName: commandName as Command })) {
    interaction.editReply({
      content:
        "Non hai l'autorizzazione necessaria per lanciare questo comando",
    });

    return;
  }

  const memberDiscordId = author.user.id;

  if (!memberDiscordId) {
    console.log(`Invalid discord id ${memberDiscordId}`);

    return;
  }

  switch (commandName) {
    case "push": {
      const user = await fetchMember({
        discordId: memberDiscordId,
      });

      const status = options.getString("status") as PushCommandStatus;

      const replyMessage = await push({ user, status });

      interaction.editReply({
        content: replyMessage,
      });
      break;
    }
    case "referral": {
      const replyMessage = await referral({
        channel: interaction.channel as TextChannel,
      });

      interaction.editReply({
        content: replyMessage,
      });
      break;
    }
    default: {
      interaction.editReply({
        content: "Il comando non è valido",
      });
    }
  }
};
