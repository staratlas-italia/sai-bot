import { NormalizedShipStakingInfoExtended } from "./index";

export type ScoreFleetResponse =
  | {
      success: false;
      error: string;
    }
  | {
      success: true;
      data: NormalizedShipStakingInfoExtended[];
    };
