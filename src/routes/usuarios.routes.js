import { Router } from "express";
import { actualizarPerfil } from "../controllers/usuarios.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = Router();
const upload = multer();

router.put(
  "/actualizar-perfil",
  verifyToken, // 🔐 usa tu middleware para obtener req.user
  upload.single("foto_perfil"),
  actualizarPerfil
);

export default router;
