export type Member = {
  public_key: string;
  discord_id: string;
  notifications?: boolean;
};

export type PushCommandStatus = "on" | "off";
