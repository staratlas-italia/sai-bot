import invariant from "invariant";
import {
  discordBotToken,
  discordChannelId,
  discordGuildId,
} from "~/common/constants";

export const checkRequiredConstants = () => {
  invariant(discordBotToken, "The discord token is not valid");
  invariant(discordChannelId, "The discord channel id is not valid");
  invariant(discordGuildId, "The discord channel id is not valid");

  return {
    discordBotToken,
    discordChannelId,
    discordGuildId,
  };
};
