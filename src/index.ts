import { discordClientInit } from "./utils/discordClientInit/index";
import {
  discordBotToken,
  discordChannelId,
  discordGuildId,
} from "./common/constants/index";
import { startInteraction } from "./utils/startInteraction/index";
import { BigQuery } from "@google-cloud/bigquery";
import discord from "discord.js";
import "dotenv/config";
import { CronJob } from "cron";
import { refillCheck } from "./utils/refillCheck";

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

discordClient.on("ready", async () => {
  try {
    const init = await discordClientInit({
      discordClient,
      bigquery,
      discordBotToken,
      discordChannelId,
      discordGuildId,
    });
    if (!init) return;
  } catch (err) {
    console.log(err);
    return;
  }
});

discordClient.on("interactionCreate", async (interaction) => {
  try {
    const launchInteraction = await startInteraction({ interaction, bigquery });
    if (!launchInteraction) return;
  } catch (err) {
    console.log(err);
    return;
  }
});

discordClient.on("error", (err) => {
  console.log(JSON.stringify(err, null, 2));
});

discordClient.login(discordBotToken);

const refillJob = new CronJob(
  "0 */1 * * *",
  () => {
    refillCheck({
      discordClient,
      bigquery,
      discordBotToken,
      discordChannelId,
      discordGuildId,
    });
  },
  null,
  true,
  "Europe/Rome"
);
