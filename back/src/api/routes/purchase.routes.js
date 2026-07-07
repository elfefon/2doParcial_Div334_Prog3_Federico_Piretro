import { Router } from "express";
import { getAllPurchases, createPurchase } from "../controllers/purchase.controllers.js";

const router = Router();

router.get("/", getAllPurchases);

router.post("/", createPurchase);

export default router;
