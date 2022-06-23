import { getUsersCollection } from "~/utils/getUsersCollection";

type Param = {
  discordId: string;
  value: boolean;
};

export const updateMemberNotificationFlag = async ({
  discordId,
  value,
}: Param) => {
  const usersCollection = getUsersCollection();

  const result = await usersCollection.updateOne(
    { discordId },
    { $set: { notifications: value } }
  );

  console.log(result);

  return result.modifiedCount === 1;
};
