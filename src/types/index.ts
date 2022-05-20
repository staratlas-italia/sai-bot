import { BN } from "@project-serum/anchor";
import { ShipStakingInfo } from "@staratlas/factory";

// DISCORD BOT
export type Member = {
  public_key: string;
  discord_id: string;
  notifications?: boolean;
};

export type Command = "push" | "referral";

export type PushCommandStatus = "on" | "off";

// REFILL JOB
export type NormalizedShipStakingInfo = {
  [key in keyof ShipStakingInfo]: ShipStakingInfo[key] extends infer U
    ? U extends BN
      ? number
      : string
    : never;
};

export type NormalizedShipStakingInfoExtended = NormalizedShipStakingInfo & {
  rewardRatePerSecond: number;
  fuelMaxReserve: number;
  foodMaxReserve: number;
  armsMaxReserve: number;
  toolkitMaxReserve: number;
  millisecondsToBurnOneFuel: number;
  millisecondsToBurnOneFood: number;
  millisecondsToBurnOneArms: number;
  millisecondsToBurnOneToolkit: number;
  dailyFuelConsumption: number;
  dailyFoodConsumption: number;
  dailyArmsConsumption: number;
  dailyToolkitConsumption: number;
  dailyFuelCostInAtlas: number;
  dailyFoodCostInAtlas: number;
  dailyArmsCostInAtlas: number;
  dailyToolkitCostInAtlas: number;
  dailyMaintenanceCostInAtlas: number;
  grossDailyRewardInAtlas: number;
  netDailyRewardInAtlas: number;
};
