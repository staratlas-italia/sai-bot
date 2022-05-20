import { Member } from "~/types/index";
import { getMembersWhoAllowedNotifications } from "~/queries/getMembersWhoAllowedNotifications/index";
import { BigQuery, BigQueryTimestamp } from "@google-cloud/bigquery";
import axios, { AxiosResponse } from "axios";
import {
  Client,
  Collection,
  Guild,
  GuildMember,
  TextChannel,
} from "discord.js";
import { getShipLevel } from "~/utils/getShipLevel";
import { ScoreFleetResponse } from "~/types/api";

type Param = {
  discordClient: Client<boolean>;
  bigquery: BigQuery;
  discordBotToken?: string;
  discordChannelId?: string;
  discordGuildId?: string;
};

export const refillCheck = async ({
  discordClient,
  bigquery,
  discordBotToken,
  discordChannelId,
  discordGuildId,
}: Param) => {
  if (!discordClient) {
    console.log("The discord client is not valid");
    return;
  }

  if (!bigquery) {
    console.log("Bigquery connection failed");
    return;
  }

  if (!discordBotToken) {
    console.log("The discord token is not valid");
    return;
  }

  if (!discordChannelId) {
    console.log("The discord channel id is not valid");
    return;
  }

  if (!discordGuildId) {
    console.log("The discord guild id is not valid");
    return;
  }

  // current datetime - 5:50 hours
  const checkTimestamp = new BigQueryTimestamp(new Date(Date.now() - 21000000));

  const currentTimestamp = new BigQueryTimestamp(new Date(Date.now()));

  const currentTime = new Date(Date.now());

  console.log("Fleets check is starting at", currentTime);

  const hour = currentTime.getHours();

  if (hour > 5 && hour < 22) {
    await discordClient.login(discordBotToken);

    const channel =
      (await discordClient.channels.cache.get(discordChannelId)) ||
      (await discordClient.channels.fetch(discordChannelId));

    const guild: Guild =
      (await discordClient.guilds.cache.get(discordGuildId)) ||
      (await discordClient.guilds.fetch(discordGuildId));

    const members: Collection<string, GuildMember> =
      await guild.members.fetch();

    const [rows] = await getMembersWhoAllowedNotifications({
      bigquery,
      checkTimestamp,
    });

    let usersNeedToRefill: string[] = [];

    let fleet: AxiosResponse<ScoreFleetResponse>;

    await Promise.all(
      rows.map(async (row: Member) => {
        if (row.public_key) {
          try {
            console.log(`checking ${row.public_key} fleet`);

            fleet = await axios.get(
              `https://app.staratlasitalia.com/api/score/${row.public_key}`
            );

            const member = members.find((m) =>
              row.discord_id
                .toLowerCase()
                .includes(m.user.username.toLowerCase())
            );

            const id = member?.id;

            if (fleet.data.success && id) {
              console.log("ID: " + id);

              for (let ship of fleet.data.data) {
                if (usersNeedToRefill.includes(id)) {
                  break;
                }

                if (getShipLevel(ship, "food") < 10) {
                  console.log(
                    "ADDED x FOOD " + getShipLevel(ship, "food") + "%: " + id
                  );
                  usersNeedToRefill.push(id);
                  continue;
                }

                if (getShipLevel(ship, "ammo") < 10) {
                  console.log(
                    "ADDED x AMMO " + getShipLevel(ship, "ammo") + "%: " + id
                  );
                  usersNeedToRefill.push(id);
                  continue;
                }

                if (getShipLevel(ship, "fuel") < 10) {
                  console.log(
                    "ADDED x FUEL " + getShipLevel(ship, "fuel") + "%: " + id
                  );
                  usersNeedToRefill.push(id);
                  continue;
                }

                if (getShipLevel(ship, "tools") < 10) {
                  console.log(
                    "ADDED x TOOLS " + getShipLevel(ship, "tools") + "%: " + id
                  );
                  usersNeedToRefill.push(id);
                }
              }
              if (usersNeedToRefill.includes(id)) {
                let queryUpdateRefillCheck: string = `UPDATE fleetsnapshots.star_atlas.players
                SET last_refill_timestamp = TIMESTAMP('${currentTimestamp.value}') WHERE public_key = '${row.public_key}'`;

                const optionsUpdateRefillCheck = {
                  query: queryUpdateRefillCheck,
                  location: "EU",
                };

                try {
                  await bigquery.query(optionsUpdateRefillCheck);
                } catch (err) {
                  console.log(err);
                }
              }
            }
          } catch (err) {
            console.log(`ERROR: ${row.public_key}`);
          }
        }
      })
    );

    console.log(`NEEDREFILL LENGTH: ${usersNeedToRefill.length}`);

    let message: string;

    if (usersNeedToRefill.length > 0) {
      const lastMessages = await (channel as TextChannel).messages.fetch({
        limit: 20,
      });

      lastMessages.forEach((msg) => {
        if (msg.author.id === discordClient.user?.id) {
          msg.delete();
        }
      });

      message = usersNeedToRefill
        .map(
          (id, index) =>
            `<@${id}>${index < usersNeedToRefill.length - 1 ? ", " : ""}`
        )
        .join("");

      message = `${message} una o più navi della vostra flotta stanno per esaurire le risorse! È il momento di rifornire l'equipaggio!`;
      console.log(message);

      (channel as TextChannel).send(message);
    }

    console.log("DONE");

    return {
      statusCode: 200,
      needRefill: usersNeedToRefill,
    };
  } else {
    console.log("STOP. IT'S TIME TO SLEEP!");

    return {
      statusCode: 200,
      needRefill: [],
    };
  }
};
