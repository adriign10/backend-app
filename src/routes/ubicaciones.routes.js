import { Router } from "express";
import { getUbicaciones, createUbicacion, updateUbicacion, deleteUbicacion } from "../controllers/ubicaciones.controller.js";

const router = Router();

// GET todas
router.get("/", getUbicaciones);

// POST crear una nueva
router.post("/", createUbicacion);

// PUT actualizar
router.put("/:id", updateUbicacion);

// DELETE eliminar
router.delete("/:id", deleteUbicacion);

export default router;
