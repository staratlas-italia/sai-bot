import { getUsersCollection } from "~/utils/getUsersCollection";

type Param = {
  checkDate: Date;
};

export const getMembersWhoAllowedNotifications = async ({
  checkDate,
}: Param) => {
  const usersCollection = getUsersCollection();

  const users = usersCollection.find({
    $or: [
      { lastRefillAt: { $lte: checkDate } },
      { lastRefillAt: { $exists: false } },
    ],
  });

  return users.toArray();
};
