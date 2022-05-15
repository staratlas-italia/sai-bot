import { BigQuery } from "@google-cloud/bigquery";
import { GuildMember, Interaction, TextChannel } from "discord.js";
import { push } from "~/commands/push";
import { referral } from "~/commands/referral";
import { queryMember } from "~/queries/queryMember";
import { Command, PushCommandStatus } from "~/types";
import { Member } from "~/types/index";
import { checkPermission } from "~/utils/checkPermission/index";

type Param = {
  interaction: Interaction;
  bigquery: BigQuery;
};

export const startInteraction = async ({ interaction, bigquery }: Param) => {
  if (!bigquery) {
    console.log("Bigquery connection failed");
    return false;
  }

  if (!interaction.isCommand()) {
    return false;
  }

  const { commandName, options } = interaction;

  const author: GuildMember = interaction.member as GuildMember;

  if (!author) {
    console.log("Author who interacted is invalid");
    return false;
  }

  // Consent to reply in ~15 minutes instead of 3 seconds
  await interaction.deferReply({ ephemeral: true });

  if (!checkPermission({ author, commandName: commandName as Command })) {
    interaction.editReply({
      content:
        "Non hai l'autorizzazione necessaria per lanciare questo comando",
    });

    return false;
  }

  const memberUsername = author.user.username.toLowerCase();

  if (!memberUsername) {
    console.log(`Invalid member username ${memberUsername}`);
    return false;
  }

  switch (commandName) {
    case "push": {
      const member: Member = await queryMember({
        bigquery,
        userIdLike: memberUsername,
      });

      if (!member) {
        console.log("Member not found", memberUsername);
        return false;
      }

      const status = options.getString("status") as PushCommandStatus;
      const replyMessage = await push({ bigquery, member, status });
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
