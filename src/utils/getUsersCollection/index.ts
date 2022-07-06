import { mongoClient } from "~/common/constants";
import { User } from "~/types";

export const getUsersCollection = () => {
  const db = mongoClient.db("app-db");

  return db.collection<User>("users");
};
