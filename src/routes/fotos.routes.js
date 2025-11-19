import { Router } from "express";
import { subirMultiplesFotos, obtenerFotos, eliminarFoto } from "../controllers/fotos.controller.js";
import { upload } from "../middlewares/multer.memory.js";

const router = Router();

router.post("/subir-multiples", upload.array("fotos"), subirMultiplesFotos);

router.get("/:id_recuerdo", obtenerFotos);

router.delete("/eliminar/:id_foto", eliminarFoto);

export default router;
