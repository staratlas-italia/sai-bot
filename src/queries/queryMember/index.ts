import { BigQuery } from "@google-cloud/bigquery";
import { Member } from "~/types";

type Param = {
  bigquery: BigQuery;
  userIdLike: string;
};

export const queryMember = async ({
  bigquery,
  userIdLike,
}: Param): Promise<Member> => {
  const query: string = `SELECT public_key, discord_id, notifications FROM fleetsnapshots.star_atlas.players WHERE discord_id LIKE @userIdLike`;

  const optionsUsers = {
    query,
    location: "EU",
    params: { userIdLike: `%${userIdLike.toUpperCase()}%` },
  };

  const [job] = await bigquery.createQueryJob(optionsUsers);
  const [rows] = await job.getQueryResults();

  return rows[0];
};
