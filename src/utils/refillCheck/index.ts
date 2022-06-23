import axios, { AxiosResponse } from "axios";
import { TextChannel } from "discord.js";
import { discordClient } from "~/common/constants";
import { getMembersWhoAllowedNotifications } from "~/queries/getMembersWhoAllowedNotifications/index";
import { ScoreFleetResponse } from "~/types/api";
import { checkRequiredConstants } from "~/utils/checkRequiredConstants";
import { getShipLevel } from "~/utils/getShipLevel";
import { getUsersCollection } from "~/utils/getUsersCollection";

export const refillCheck = async () => {
  const { discordBotToken, discordChannelId } = checkRequiredConstants();

  // current datetime - 5:50 hours
  const checkDate = new Date(Date.now() - 21_000_000);

  const currentTime = new Date();

  const hour = currentTime.getUTCHours();

  console.log("Fleets check is starting at", hour);

  if (hour <= 5 || hour >= 22) {
    console.log("skipping check between 22pm and 5am");

    return;
  }

  await discordClient.login(discordBotToken);

  const channel =
    (await discordClient.channels.cache.get(discordChannelId)) ||
    (await discordClient.channels.fetch(discordChannelId));

  const users = await getMembersWhoAllowedNotifications({
    checkDate,
  });

  const usersNeedToRefill = new Set<string>();

  let fleet: AxiosResponse<ScoreFleetResponse>;

  await Promise.all(
    users.map(async (user) => {
      for (let wallet of user.wallets) {
        console.log(`Checking ${wallet} fleet of user ${user.discordId}`);

        try {
          fleet = await axios.get(
            `https://app.staratlasitalia.com/api/score/${wallet}`
          );
        } catch (e) {
          console.log(JSON.stringify(e));
          continue;
        }

        const id = user.discordId;

        if (fleet.data.success) {
          for (let ship of fleet.data.data) {
            if (usersNeedToRefill.has(id)) {
              break;
            }

            if (getShipLevel(ship, "food") < 10) {
              console.log(
                "ADDED x FOOD " + getShipLevel(ship, "food") + "%: " + id
              );
              usersNeedToRefill.add(id);
              continue;
            }

            if (getShipLevel(ship, "ammo") < 10) {
              console.log(
                "ADDED x AMMO " + getShipLevel(ship, "ammo") + "%: " + id
              );
              usersNeedToRefill.add(id);
              continue;
            }

            if (getShipLevel(ship, "fuel") < 10) {
              console.log(
                "ADDED x FUEL " + getShipLevel(ship, "fuel") + "%: " + id
              );
              usersNeedToRefill.add(id);
              continue;
            }

            if (getShipLevel(ship, "tools") < 10) {
              console.log(
                "ADDED x TOOLS " + getShipLevel(ship, "tools") + "%: " + id
              );
              usersNeedToRefill.add(id);
            }
          }
        }
      }
    })
  );

  const usersCollection = getUsersCollection();

  const result = await usersCollection.updateMany(
    {
      discordId: { $in: [...usersNeedToRefill] },
    },
    { $set: { lastRefillAt: currentTime } }
  );

  console.log(
    "Update lastRefillAt success =",
    result.modifiedCount === usersNeedToRefill.size
  );

  console.log(`NEED REFILL LENGTH: ${usersNeedToRefill.size}`);

  let message: string;

  if (usersNeedToRefill.size > 0) {
    const lastMessages = await (channel as TextChannel).messages.fetch({
      limit: 20,
    });

    lastMessages.forEach((msg) => {
      if (msg.author.id === discordClient.user?.id) {
        msg.delete();
      }
    });

    message = [...usersNeedToRefill]
      .map(
        (id, index) =>
          `<@${id}>${index < usersNeedToRefill.size - 1 ? ", " : ""}`
      )
      .join("");

    message = `${message} una o più navi della vostra flotta stanno per esaurire le risorse! È il momento di rifornire l'equipaggio!`;

    (channel as TextChannel).send(message);
  }

  console.log("DONE");
};
