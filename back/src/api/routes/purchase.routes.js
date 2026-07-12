import { Router } from "express";
import { getAllPurchases, createPurchase, downloadPurchasesExcel } from "../controllers/purchase.controllers.js";

const router = Router();

router.get("/excel", downloadPurchasesExcel);

router.get("/", getAllPurchases);

router.post("/", createPurchase);

export default router;
