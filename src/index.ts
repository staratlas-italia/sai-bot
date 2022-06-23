import { CronJob } from "cron";
import "dotenv/config";
import {
  discordBotToken,
  discordClient,
  mongoClient,
} from "~/common/constants";
import { onDiscordClientReady } from "~/events/onDiscordClientReady";
import { onInteractionCreate } from "~/events/onInteractionCreate";
import { refillCheck } from "./utils/refillCheck";

const run = async () => {
  try {
    await mongoClient.connect();
  } catch (e) {
    console.log("cannot connect to mongo...", JSON.stringify(e));
    process.exit(1);
  }

  console.log("Connected.");

  discordClient.on("ready", onDiscordClientReady);

  discordClient.on("interactionCreate", onInteractionCreate);

  discordClient.login(discordBotToken);

  new CronJob("0 */1 * * *", refillCheck, null, true, "Europe/Rome");
};

process.on("SIGINT", async () => {
  await mongoClient.close();

  process.exit(0);
});

run();
