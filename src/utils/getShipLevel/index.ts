import { NormalizedShipStakingInfoExtended } from "~/types";

export const getShipLevel = (
  ship: NormalizedShipStakingInfoExtended,
  type: "food" | "tools" | "ammo" | "fuel"
) => {
  // ritorna quanto è rimasto in percentuale di una specifica risorsa
  return getRemainResDetails(type, ship, timePassSinceLastAction(ship));
};

const getRemainResDetails = (
  type: "food" | "tools" | "ammo" | "fuel",
  ship: NormalizedShipStakingInfoExtended,
  timePassSinceStart: number
): number => {
  let resCurrentCapacity: number;

  switch (type) {
    case "ammo":
      resCurrentCapacity = ship.armsCurrentCapacity;
      break;
    case "food":
      resCurrentCapacity = ship.foodCurrentCapacity;
      break;
    case "fuel":
      resCurrentCapacity = ship.fuelCurrentCapacity;
      break;
    case "tools":
      resCurrentCapacity = ship.healthCurrentCapacity;
      break;
  }

  const secondsLeft = getRemainResSec(type, ship, timePassSinceStart);
  const totalSeconds = resCurrentCapacity;

  return (secondsLeft * 100) / totalSeconds;
};

const timePassSinceLastAction = (
  ship: NormalizedShipStakingInfoExtended
): number => {
  // tempo trascorso dall'ultima operazione di refill su una nave in secondi
  let timePassSinceStart = getTimePass(ship.currentCapacityTimestamp);

  // tempo rimasto in secondi prima di dover fare nuovamente il refill di una specifica risorsa
  const [foodRemainSec, armsRemainSec, fuelRemainSec, healthRemainSec] = [
    getRemainResSec("food", ship),
    getRemainResSec("ammo", ship),
    getRemainResSec("fuel", ship),
    getRemainResSec("tools", ship),
  ];

  // tempo rimasto prima che una risorsa della nave raggiunga lo 0%
  const depletionTime = Math.min(
    foodRemainSec,
    armsRemainSec,
    fuelRemainSec,
    healthRemainSec
  );

  if (depletionTime < 0) {
    timePassSinceStart = depletionTime + timePassSinceStart;
  }

  return timePassSinceStart;
};

// tempo rimasto in secondi prima di dover fare nuovamente il refill di una specifica risorsa
const getRemainResSec = (
  type: "food" | "tools" | "ammo" | "fuel",
  ship: NormalizedShipStakingInfoExtended,
  _timePass: number | undefined = undefined
): number => {
  // tempo passato dall'ultimo refill
  let timePass =
    _timePass != undefined
      ? _timePass
      : getTimePass(ship.currentCapacityTimestamp);

  let remainTime: number;

  /*
   * armsCurrentCapacity, foodCurrentCapacity, fuelCurrentCapacity, healthCurrentCapacity
   * sono i secondi prima che una delle risorse finisca dopo l'ultimo refill effettuato.
   * Questo valore cambia solo quando si fa il refill di una o più risorse ed è calcolato in
   * base alla quantità di risorse immesse
   * */
  switch (type) {
    case "ammo":
      remainTime = ship.armsCurrentCapacity - timePass;
      break;
    case "food":
      remainTime = ship.foodCurrentCapacity - timePass;
      break;
    case "fuel":
      remainTime = ship.fuelCurrentCapacity - timePass;
      break;
    case "tools":
      remainTime = ship.healthCurrentCapacity - timePass;
      break;
  }

  return remainTime;
};

// currentCapacityTimestamp: ultima volta che hai fatto refill (qualsiasi quantità) di una o più risorse di una nave in secondi
// tempo trascorso dall'ultima operazione di refill su una nave in secondi
const getTimePass = (currentCapacityTimestamp: number): number => {
  const now = Date.now() / 1000;
  const timePass = now - currentCapacityTimestamp;
  return timePass;
};
