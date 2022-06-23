import discord from "discord.js";
import { MongoClient, ServerApiVersion } from "mongodb";
import { Command } from "~/types";

export const genesisHolderRoleId = "969209584877199370";

export const debugRoleId = "973203968530472990";

export const grantedRoles = [genesisHolderRoleId, debugRoleId];

export const needsPermissionCommands: Command[] = ["push"];

export const discordBotToken = process.env.DISCORD_BOT_TOKEN;

export const discordChannelId = process.env.CHANNEL_ID;

export const discordGuildId = process.env.GUILD_ID;

export const discordClient = new discord.Client({
  intents: [
    discord.Intents.FLAGS.GUILDS,
    discord.Intents.FLAGS.GUILD_MEMBERS,
    discord.Intents.FLAGS.GUILD_MESSAGES,
  ],
});

const uri = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PWD}@sai-main.eh3jch5.mongodb.net/?retryWrites=true&w=majority`;

export const mongoClient = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});
