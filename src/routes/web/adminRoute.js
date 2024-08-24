import express from "express";
import multer from "multer";
import homeController from "../../controllers/web/homeController.js";
import categoryController from "../../controllers/web/categoryController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

router.get('/', homeController);

router.get('/category', categoryController.getCategoryPage);
router.get('/category/insert', categoryController.getAddCategoryPage);
router.post('/category', upload.single("image"), categoryController.postAddCategory);
router.get('/category/:id', categoryController.getCategoryDetail);
router.put('/category/:id', upload.single("image"), categoryController.putUpdateCategory);
router.get('/category/status/201', categoryController.addSuccess);
router.get('/category/status/400', categoryController.add400);
router.get('/category/status/404', categoryController.categoryNotFound);
router.get('/category/status/500', categoryController.serverError);

export default router;
