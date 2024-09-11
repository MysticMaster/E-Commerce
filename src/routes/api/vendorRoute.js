import express from "express";
import multer from "multer";
import productApiController from "../../controllers/api/vendor/productApiController.js";
import orderApiController from "../../controllers/api/vendor/orderApiController.js";
import categoryApiController from "../../controllers/api/vendor/categoryApiController.js";
import productGroupApiController from "../../controllers/api/vendor/productGroupApiController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {fileSize: 25 * 1024 * 1024}
});

router.get("/categories", categoryApiController.getCategories);

router.post("/products",
    upload.fields([
        {name: "productThumbnail", maxCount: 1},
        {name: "classificationThumbnails"}
    ]),
    productApiController.postProduct);
router.get("/products", productApiController.getProducts);
router.get("/products/:id", productApiController.getProductById);
router.patch("/products/:id/info", productApiController.patchProduct);
router.patch("/products/:id/thumbnail", upload.single('file'), productApiController.patchProductUpdateThumbnail);
router.patch("/products/:id/media", upload.array("files"), productApiController.patchProductInsertMedia);
router.patch("/products/:id/classification", upload.single("file"), productApiController.patchProductInsertClassification);
router.delete("/products/:id/media/:mediaId", productApiController.deleteProductDeleteMedia);
router.patch("/products/:id/status", productApiController.patchProductChangeStatus);
router.patch("/products/:productId/:classificationId/info", productApiController.patchClassification);
router.patch("/products/:productId/:classificationId/thumbnail", upload.single('file'), productApiController.patchClassificationUpdateThumbnail);

router.post("/groups", upload.single('file'), productGroupApiController.postProductGroup);
router.get("/groups", productGroupApiController.getProductGroups);
router.get("/groups/:id", productGroupApiController.getProductGroup);
router.patch("/groups/:id/product", productGroupApiController.patchProductGroupInsertProduct);
router.delete("/groups/:id/product/:productId", productGroupApiController.deleteProductGroupDeleteProduct);
router.patch("/groups/:id/thumbnail", upload.single('file'), productGroupApiController.patchProductGroupUpdateThumbnail);
router.delete("/groups/:id", productGroupApiController.deleteProductGroup);

router.get("/orders", orderApiController.getOrders);
router.get("/orders/:id", orderApiController.getOrderById);
router.patch("/orders/:id/confirm", orderApiController.patchConfirmOrder);
router.patch("/orders/:id/ship", orderApiController.patchShipOrder);
router.patch("/orders/:id/deliver", orderApiController.patchDeliverOrder);
router.patch("/orders/:id/refuse", orderApiController.patchRefuseOrder);

export default router;
