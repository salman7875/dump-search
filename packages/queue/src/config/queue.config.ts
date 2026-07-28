import redisClient from "./redis.config.js";
import { ConnectionOptions, createNodeRedisClient } from "bullmq";

const connection = createNodeRedisClient(
  redisClient as unknown as ConnectionOptions,
);

export default connection;
