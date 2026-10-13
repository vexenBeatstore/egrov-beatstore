import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import beatsRouter from "./beats";
import licensesRouter from "./licenses";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(beatsRouter);
router.use(licensesRouter);

export default router;
