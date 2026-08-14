import express from 'express';
import cors from 'cors';
import db from '@repo/db';
import { ListBucketsCommand } from '@aws-sdk/client-s3';

import s3Client from './libs/s3/index.js'
// import { uploadRoutes } from "./modules/upload/index.ts";
// import { retrieveRoutes } from "./modules/retrieve/index.js";
// import db from './libs/schema/db.js';

import { uploadRoutes } from './modules/upload/index.js';
import { retrieveRoutes } from './modules/retrieve/index.js';

const app = express();

app.use(express.json());
app.use(cors());

const command = new ListBucketsCommand({ MaxBuckets: Number("int"), ContinuationToken: "STRING_VALUE", Prefix: "STRING_VALUE", BucketRegion: "STRING_VALUE" });
s3Client.send(command).then((data) => {
  console.log("Buckets:", data.Buckets);
}).catch((error) => {
  console.error("Error listing buckets:", error);
});

app.use('/doc/upload', uploadRoutes);
app.use('/doc/retrieve', retrieveRoutes);

export default app;
