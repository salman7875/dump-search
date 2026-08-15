import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

type CreateObjectT = {
  bucketName: string;
  key: string;
  contentType: string;
};

export const createObjectCommand = async ({
  bucketName,
  key,
  contentType,
}: CreateObjectT) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  return command;
};

export const getObjectCommand = async ({
  bucketName,
  key,
}: {
  bucketName: string;
  key: string;
}) => {
  const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
  return command;
};
