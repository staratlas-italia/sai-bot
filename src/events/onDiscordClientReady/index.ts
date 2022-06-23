import { Constants, Guild } from "discord.js";
import { discordClient } from "~/common/constants";
import { checkRequiredConstants } from "~/utils/checkRequiredConstants";

export const onDiscordClientReady = async () => {
  const { discordGuildId } = checkRequiredConstants();

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
        type: Constants.ApplicationCommandOptionTypes.STRING,
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
