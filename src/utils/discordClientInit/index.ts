import { BigQuery } from "@google-cloud/bigquery";
import discord, { Client, Guild } from "discord.js";

type Param = {
  discordClient: Client;
  bigquery: BigQuery;
  discordBotToken?: string;
  discordChannelId?: string;
  discordGuildId?: string;
};

export const discordClientInit = async ({
  discordClient,
  bigquery,
  discordBotToken,
  discordChannelId,
  discordGuildId,
}: Param) => {
  if (!bigquery) {
    console.log("Bigquery connection failed");
    return false;
  }

  if (!discordBotToken) {
    console.log("The discord token is not valid");
    return false;
  }

  if (!discordChannelId) {
    console.log("The discord channel id is not valid");
    return false;
  }

  if (!discordGuildId) {
    console.log("The discord guild id is not valid");
    return false;
  }

  const guild: Guild =
    (await discordClient.guilds.cache.get(discordGuildId)) ||
    (await discordClient.guilds.fetch(discordGuildId));

  let commands = guild ? guild.commands : discordClient.application?.commands;

  if (!commands) {
    console.log("No command manager available");
    return false;
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

  commands.create({
    name: "referral",
    description: "Get referral server link",
  });

  console.log("Discord client is ready!");
};
