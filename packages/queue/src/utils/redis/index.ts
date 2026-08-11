import redisClient from "../../config/redis.config.js";

export const getAllHashEntries = async () => {
  const corpusLen = await redisClient.hGet("upload:corpus", "length");
  const uniqueTokens = await redisClient.SMEMBERS("unique:tokens");

  if (!corpusLen) {
    throw new Error("No Corpus length is present");
  }

  const multi = redisClient.multi();

  for (const uniqueToken of uniqueTokens) {
    const docCount = await redisClient.hGet(`token:${uniqueToken}`, "docCount");
    const idf = Math.log(Number(corpusLen) / Number(docCount));
    // await redisClient.hSet("idf", uniqueToken, idf);
    multi.hSet("idf", uniqueToken, idf);
  }
  await multi.exec();
  console.log("IDF Calculated and stored!");
};
