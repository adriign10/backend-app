import express from 'express';
import cors from 'cors';
import { db } from './config/db.js';
import dotenv from 'dotenv';
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// rutas
app.use("/api/auth", authRoutes);

export default app;
