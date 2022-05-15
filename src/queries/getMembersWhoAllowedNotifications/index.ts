import { BigQuery, BigQueryTimestamp } from "@google-cloud/bigquery";
import { Member } from "~/types";

type Param = {
  bigquery: BigQuery;
  checkTimestamp: BigQueryTimestamp;
};

export const getMembersWhoAllowedNotifications = async ({
  bigquery,
  checkTimestamp,
}: Param): Promise<[Member[]]> => {
  const query: string = `SELECT public_key, discord_id, notifications, last_refill_timestamp
                           FROM fleetsnapshots.star_atlas.players 
                           WHERE notifications = true AND (last_refill_timestamp <= TIMESTAMP(@checkTimestamp) OR last_refill_timestamp IS NULL)`;

  const options = {
    query: query,
    location: "EU",
    params: { checkTimestamp: checkTimestamp.value },
  };

  const [job] = await bigquery.createQueryJob(options);
  const [rows] = await job.getQueryResults();

  return [rows];
};
