import { Router } from "express";
import { getRecuerdosUsuario ,obtenerAmigosRecuerdo, createRecuerdo, updateRecuerdo, getRecuerdoById, agregarAmigosRecuerdo  } from "../controllers/recuerdos.controller.js";
import multer from "multer";

const router = Router();
const upload = multer();

router.post("/", createRecuerdo);
// Guardar amigos mencionados en un recuerdo
router.post("/:id_recuerdo/amigos", agregarAmigosRecuerdo);

router.get("/:id_recuerdo/amigos", obtenerAmigosRecuerdo);

// NUEVO — editar colección
router.put("/:id_recuerdo", upload.single("foto"), updateRecuerdo);
router.get("/:id_recuerdo", getRecuerdoById);

router.get('/', getRecuerdosUsuario);


export default router;
