import { createClient } from "redis";

const redisClient = createClient({
  socket: { host: "redis-infra", port: 6379 },
});

redisClient.on("error", (err) => console.error("Redis Error:", err));

(async () => {
  try {
    await redisClient.connect();
    console.log(`Redis client connected!`);
  } catch (error) {
    console.log(`Sometthing went wrong connecting redis: ${error}`);
  }
})();

export default redisClient;
