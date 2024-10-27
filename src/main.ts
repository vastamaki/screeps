import { creepManager } from "lib/creepManager";

export const loop = () => {
  const start = Date.now();
  creepManager();
  console.log(`Tick took ${Date.now() - start}ms`);
};
