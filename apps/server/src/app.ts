import { config } from 'dotenv';
config();
import express from 'express';
import cors from 'cors';
import db from '@repo/db';

import { uploadRoutes } from './modules/upload/index.js';
import { retrieveRoutes } from './modules/retrieve/index.js';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/health', (req, res) => {
  res.status(200).json({ sucess: true, message: 'Healthy!' });
});

app.use('/doc/upload', uploadRoutes);
app.use('/doc/retrieve', retrieveRoutes);

export default app;
