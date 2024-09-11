import express from "express";
import multer from "multer";
import productApiController from "../../controllers/api/buyer/productApiController.js";
import cartApiController from "../../controllers/api/buyer/cartApiController.js";
import orderApiController from "../../controllers/api/buyer/orderApiController.js";
import categoryApiController from "../../controllers/api/buyer/categoryApiController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {fileSize: 25 * 1024 * 1024}
});

router.get("/categories", categoryApiController.getCategories);

router.get("/products", productApiController.getProducts);
router.get("/products/:id", productApiController.getProductById);

router.get("/carts", cartApiController.getCarts);
router.post("/carts", cartApiController.postCart);
router.patch("/carts/:id/info", cartApiController.patchCart);
router.patch("/carts/:id/plus", cartApiController.patchCartPlus);
router.patch("/carts/:id/minus", cartApiController.patchCartMinus);
router.delete("/carts/:id", cartApiController.deleteCart);

router.get("/orders",orderApiController.getOrders);
router.post("/orders", orderApiController.postOrder);
router.patch("/orders/:id/receive",orderApiController.patchReceiveOrder);
router.patch("/orders/:id/cancel", orderApiController.patchCancelOrder);
router.delete("/orders/:id", orderApiController.deleteOrder);

export default router;
