import { Router } from "express";
import { createRecuerdo } from "../controllers/recuerdos.controller.js";

const router = Router();

router.post("/", createRecuerdo);

export default router;
