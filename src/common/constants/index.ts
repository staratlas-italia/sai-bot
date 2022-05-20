import { Command } from "~/types";

export const genesisHolderRoleId = "969209584877199370";

export const debugRoleId = "973203968530472990";

export const grantedRoles = [genesisHolderRoleId, debugRoleId];

export const needsPermissionCommands: Command[] = ["push"];

export const discordBotToken = process.env.DISCORD_BOT_TOKEN;

export const discordChannelId = process.env.CHANNEL_ID;

export const discordGuildId = process.env.GUILD_ID;
