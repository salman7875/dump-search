import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "./s3-client.js";

export const generateSignedUrl = async (command: any) => {
  const url = await getSignedUrl(s3Client, command);

  return url;
};
