import { quicker } from "@repo/utils";
import { DocObj, VocabObj } from "../types/index.js";
import redisClient from "../../../../config/redis.config.js";

export const calculateDocFrequency = async (
  data: DocObj,
  multi: ReturnType<typeof redisClient.multi>,
) => {
  try {
    const titlePipeline = quicker.processTextPipeline(data.title);
    const bodyPipeline = quicker.processTextPipeline(data.text);

    const tokenTitle = titlePipeline.map((t) => ({
      ...t,
      literal: `${t.literal}-title`,
    }));
    const allTokens = [...tokenTitle, ...bodyPipeline];
    const seen = new Map<string, VocabObj>();
    for (const t of allTokens) {
      if (!seen.has(t.literal)) {
        seen.set(t.literal, t);
      }
    }

    for (const [literal, token] of seen) {
      const tokenKey = `token:${literal}`;
      multi.HINCRBY(tokenKey, "docCount", 1);
      multi.HSET(tokenKey, {
        literalToken: token.literal,
        phoneticToken: token.phonetic,
        altPhoneticToken: token.altPhonetic,
      });
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};
