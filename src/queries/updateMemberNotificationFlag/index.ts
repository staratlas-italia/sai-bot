import { BigQuery } from "@google-cloud/bigquery";

type Param = {
  bigquery: BigQuery;
  discordId: string;
  value: boolean;
};

export const updateMemberNotificationFlag = async ({
  bigquery,
  discordId,
  value,
}: Param) => {
  const query: string = `UPDATE fleetsnapshots.star_atlas.players SET notifications = ${value} WHERE discord_id = '${discordId.toUpperCase()}'`;

  const optionsUpdateOn = {
    query,
    location: "EU",
  };

  try {
    const q = await bigquery.query(optionsUpdateOn);

    return true;
  } catch (err) {
    console.log(err);

    return false;
  }
};
