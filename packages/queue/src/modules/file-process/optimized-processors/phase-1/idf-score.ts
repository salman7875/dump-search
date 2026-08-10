import { getAllHashEntries } from "../../../../utils/redis/index.js";

export const calculateIdfScore = async () => {
  await getAllHashEntries();
};
