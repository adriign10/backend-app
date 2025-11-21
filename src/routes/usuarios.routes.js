import { Router } from "express";
import { actualizarPerfil } from "../controllers/usuarios.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import multer from "multer";
import { eliminarAmigo, buscarUsuarios, enviarSolicitudAmistad, responderSolicitudAmistad, obtenerSolicitudesAmistad, obtenerAmigos } from "../controllers/usuarios.controller.js";

const router = Router();
const upload = multer();

router.put(
  "/actualizar-perfil",
  verifyToken, // 🔐 usa tu middleware para obtener req.user
  upload.single("foto_perfil"),
  actualizarPerfil
);

router.get("/buscar", verifyToken, buscarUsuarios);

// Obtener amigos (aceptados)
router.get("/amigos/:id_usuario", verifyToken, obtenerAmigos);

// Enviar solicitud
router.post("/amistad/enviar", verifyToken, enviarSolicitudAmistad);

// Responder solicitud (aceptar/rechazar)
router.post("/amistad/responder", verifyToken, responderSolicitudAmistad);

router.post("/amistad/eliminar", verifyToken, eliminarAmigo);

// Obtener solicitudes recibidas
router.get("/amistad/solicitudes/:id_usuario", verifyToken, obtenerSolicitudesAmistad);
export default router;
