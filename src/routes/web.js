import express from "express";
import multer from "multer";
import homeController from "../controllers/web/homeController.js";
import categoryController from "../controllers/web/categoryController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

router.get('/', homeController);

router.get('/category', categoryController.getCategoryPage);
router.get('/category/insert',  categoryController.getAddCategoryPage);
router.post('/category',upload.single("image"), categoryController.postAddCategory);
router.get('/category/201', upload.single("image"), categoryController.addSuccess);
router.get('/category/400', upload.single("image"), categoryController.add400);
router.get('/category/500', upload.single("image"), categoryController.serverError);

export default router;
