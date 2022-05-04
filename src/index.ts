import { BigQuery } from "@google-cloud/bigquery";
import discord, { Guild } from "discord.js";
import "dotenv/config";
import { push } from "~/commands/push";
import { queryMember } from "~/queries/queryMember";
import { PushCommandStatus } from "~/types";

const bigquery: BigQuery = new BigQuery({
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  projectId: "fleetsnapshots",
});

const discordClient = new discord.Client({
  intents: [
    discord.Intents.FLAGS.GUILDS,
    discord.Intents.FLAGS.GUILD_MEMBERS,
    discord.Intents.FLAGS.GUILD_MESSAGES,
  ],
});

const discordBotToken = process.env.DISCORD_BOT_TOKEN;

discordClient.on("ready", async () => {
  if (!discordBotToken) {
    console.log("The discord token is not valid");
    return;
  }

  const discordChannelId = process.env.CHANNEL_ID;

  if (!discordChannelId) {
    console.log("The discord channel id is not valid");
    return;
  }

  const discordGuildId = process.env.GUILD_ID;

  if (!discordGuildId) {
    console.log("The discord guild id is not valid");
    return;
  }

  const guild: Guild =
    (await discordClient.guilds.cache.get(discordGuildId)) ||
    (await discordClient.guilds.fetch(discordGuildId));

  let commands = guild ? guild.commands : discordClient.application?.commands;

  if (!commands) {
    console.log("No command manager available");
    return;
  }

  commands.create({
    name: "push",
    description: "Refill push notifications",
    options: [
      {
        name: "status",
        description: "on/off",
        type: discord.Constants.ApplicationCommandOptionTypes.STRING,
        required: true,
      },
    ],
  });

  console.log("Discord client is ready!");
});

discordClient.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const { commandName, options } = interaction;

  const memberUsername = interaction.member?.user.username.toLowerCase();

  if (!memberUsername) {
    console.log(`Invalid member username ${memberUsername}`);
    return;
  }

  const member = await queryMember({ bigquery, userIdLike: memberUsername });

  if (!member) {
    console.log("Member not found", memberUsername);
    return;
  }

  // Consent to reply in ~15 minutes instead of 3 seconds
  await interaction.deferReply({ ephemeral: true });

  switch (commandName) {
    case "push": {
      const status = options.getString("status") as PushCommandStatus;
      const replyMessage = await push({ bigquery, member, status });

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
});

discordClient.on("error", (err) => {
  console.log(JSON.stringify(err, null, 2));
});

discordClient.login(discordBotToken);
