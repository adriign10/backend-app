import { Router } from "express";
import { register, login, profile, googleLogin } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin); // <-- ruta para login Google
router.get("/profile", verifyToken, profile);

export default router;
