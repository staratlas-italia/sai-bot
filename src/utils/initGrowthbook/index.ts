import axios from "axios";
import invariant from "invariant";
import { featuresEndpoint, growthbook } from "~/common/constants";

export const initGrowthbook = async () => {
  invariant(featuresEndpoint, "The featureEnpoints has an invalid value");

  try {
    const { data } = await axios.get<{ features: any }>(featuresEndpoint);

    growthbook.setFeatures(data.features);
  } catch (e) {
    console.log("Failed to load experiments");
  }

  return growthbook;
};
