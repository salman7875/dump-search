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
    const tokenMetaData = new Map<string, { count: 0; position: number[] }>();

    for (const t of allTokens) {
      if (!seen.has(t.literal)) {
        seen.set(t.literal, t);
        tokenMetaData.set(t.literal, { count: 0, position: [0] });
        multi.del(`pos:${t.literal}`);
        multi.rPush(`pos:${t.literal}`, "0");
      } else {
        const meta = tokenMetaData.get(t.literal) as {
          count: 0;
          position: number[];
        };
        meta.count += 1;
        const position = (meta.position.at(-1) as number) + t.literal.length;
        meta.position.push(position);
        multi.rPush(`pos:${t.literal}`, position.toString());
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
      const meta = tokenMetaData.get(literal) as {
        count: number;
        position: number[];
      };

      multi.HSET(tokenKey, "tokenCount", meta.count);
      multi.HSET(tokenKey, "tf", Number(meta.count / allTokens.length));
      multi.SADD("unique:tokens", literal);
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};
