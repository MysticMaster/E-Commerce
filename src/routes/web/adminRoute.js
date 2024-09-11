import express from "express";
import multer from "multer";
import homeController from "../../controllers/web/homeController.js";
import categoryController from "../../controllers/web/categoryController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

router.get('/', homeController);

router.get('/categories', categoryController.getCategoryPage);
router.get('/categories/new', categoryController.getAddCategoryPage);
router.post('/categories', upload.single("file"), categoryController.postAddCategory);
router.get('/categories/:id', categoryController.getCategoryDetail);
router.put('/categories/:id', upload.single("file"), categoryController.patchUpdateCategory);
router.get('/categories/status/201', categoryController.addSuccess);
router.get('/categories/status/400', categoryController.add400);
router.get('/categories/status/404', categoryController.categoryNotFound);
router.get('/categories/status/500', categoryController.serverError);

export default router;
