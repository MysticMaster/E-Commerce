import express from "express";
import multer from "multer";
import productApiController from "../../controllers/api/vender/productApiController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 }
});

router.get("/product", productApiController.getProductsByVendorId);
router.get("/product/:id", productApiController.getProductById);
router.post("/product", upload.array('files', 5), productApiController.postProduct);
router.put("/product/insert-media/:id", upload.single("file"), productApiController.putProductInsertMedia);
router.put("/product/delete-media/:id", upload.single("file"), productApiController.putProductDeleteMedia);

export default router;
