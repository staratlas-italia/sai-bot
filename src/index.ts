import { Member } from "./types/index";
import { BigQuery } from "@google-cloud/bigquery";
import discord, { Guild } from "discord.js";
import "dotenv/config";

const options = {
  keyFilename: "./service_account.json",
  projectId: "fleetsnapshots",
};

const bigquery: BigQuery = new BigQuery(options);

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

  let commands;

  if (guild) {
    commands = guild.commands;
  } else {
    commands = discordClient.application?.commands;
  }

  commands?.create({
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
});

discordClient.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const { commandName, options } = interaction;

  // PUSH NOTIFICATIONS COMMAND
  if (commandName === "push") {
    const queryUsers: string = `SELECT public_key, discord_id, notifications
                                FROM fleetsnapshots.star_atlas.players`;

    const optionsUsers = {
      query: queryUsers,
      location: "EU",
    };

    const [job] = await bigquery.createQueryJob(optionsUsers);
    const [rows] = await job.getQueryResults();

    // ON
    if (options.getString("status") == "on") {
      const member: Member = rows.find((row) =>
        row.discord_id
          .toLowerCase()
          .includes(interaction.member?.user.username.toLowerCase())
      );

      if (!member) {
        interaction.reply({
          content: "C'è stato un errore imprevisto, riprova più tardi",
          ephemeral: true,
        });
        return;
      }

      if (!member.notifications || member.notifications == null) {
        const queryUpdateOn: string = `UPDATE fleetsnapshots.star_atlas.players
        SET notifications = true WHERE discord_id = '${member.discord_id.toUpperCase()}'`;

        const optionsUpdateOn = {
          query: queryUpdateOn,
          location: "EU",
        };

        try {
          const q = await bigquery.query(optionsUpdateOn);
          console.log(q);

          interaction.reply({
            content: "Le notifiche sono state ATTIVATE con successo 🚀",
            ephemeral: true,
          });
        } catch (err) {
          console.log(err);

          interaction.reply({
            content: "C'è stato un errore imprevisto, riprova più tardi",
            ephemeral: true,
          });
        }
      } else {
        interaction.reply({
          content: "Le notifiche sono già attive",
          ephemeral: true,
        });
      }
    }
    // OFF
    else if (options.getString("status") == "off") {
      const member: Member = rows.find((row) =>
        row.discord_id
          .toLowerCase()
          .includes(interaction.member?.user.username.toLowerCase())
      );

      if (!member) {
        interaction.reply({
          content: "C'è stato un errore imprevisto, riprova più tardi",
          ephemeral: true,
        });
        return;
      }

      if (member.notifications) {
        const queryUpdateOff: string = `UPDATE fleetsnapshots.star_atlas.players
        SET notifications = false WHERE discord_id = '${member.discord_id.toUpperCase()}'`;

        const optionsUpdateOff = {
          query: queryUpdateOff,
          location: "EU",
        };

        try {
          const q = await bigquery.query(optionsUpdateOff);
          console.log(q);

          interaction.reply({
            content: "Le notifiche sono state DISATTIVATE con successo",
            ephemeral: true,
          });
        } catch (err) {
          console.log(err);

          interaction.reply({
            content: "C'è stato un errore imprevisto, riprova più tardi",
            ephemeral: true,
          });
        }
      } else {
        interaction.reply({
          content: "Le notifiche sono già disattivate",
          ephemeral: true,
        });
      }
    }
    // ERROR
    else {
      interaction.reply({
        content:
          "Il comando non è valido, lo status può essere solo on oppure off",
        ephemeral: true,
      });
    }
  }
});

discordClient.login(discordBotToken);
