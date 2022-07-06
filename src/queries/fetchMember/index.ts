import { WithId } from "mongodb";
import { User } from "~/types";
import { getUsersCollection } from "~/utils/getUsersCollection";

type Param = {
  discordId: string;
};

export const fetchMember = async ({
  discordId,
}: Param): Promise<WithId<User> | null> => {
  const usersCollection = getUsersCollection();

  const user = await usersCollection.findOne({ discordId });

  return user;
};
