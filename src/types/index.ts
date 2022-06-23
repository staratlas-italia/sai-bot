import { BN } from "@project-serum/anchor";
import { ShipStakingInfo } from "@staratlas/factory";

export type User = {
  createdAt?: Date;
  discordId: string;
  faction?: string;
  lastRefillAt?: Date;
  notifications: boolean;
  players: any[];
  tier?: 0 | 1 | 2;
  wallets: string[];
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
