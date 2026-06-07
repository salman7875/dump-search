import express from "express";
import cors from "cors";

import { uploadRoutes } from "./modules/upload/index.js";
import { retrieveRoutes } from "./modules/retrieve/index.js";
import db from "./libs/schema/db.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/doc/upload", uploadRoutes);
app.use("/doc/retrieve", retrieveRoutes);

export default app;
