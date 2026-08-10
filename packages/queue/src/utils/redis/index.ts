import redisClient from "../../config/redis.config.js";

export const getAllHashEntries = async () => {
  const corpusLen = await redisClient.hGet("upload:corpus", "length");

  if (!corpusLen) {
    throw new Error("No Corpus length is present");
  }

  const docFreq = new Map<string, number>();
  let cursor = "0";

  do {
    const reply = await redisClient.hScan("upload:docfreq", cursor, {
      COUNT: 5000,
    });
    cursor = reply.cursor;

    const pipeline = redisClient.multi();

    for (let i = 0; i < reply.entries.length; i++) {
      const entry = reply.entries[i] as any;

      docFreq.set(entry.field, Number(entry.value));
    }
    for (const entry of reply.entries) {
      const token = entry.field;
      const count = Number(entry.value);

      const idf = Number(Math.log(Number(corpusLen) / count)).toFixed(3);
      pipeline.hSet("upload:idf", token, idf);
    }

    await pipeline.exec();
  } while (cursor !== "0");
};
